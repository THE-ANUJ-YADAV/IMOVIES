import crypto from 'crypto';
import QRCode from 'qrcode';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { SeatHold } from '../models/SeatHold.js';
import { config } from '../config/env.js';
import { broadcastSeatUpdate } from '../sockets/socketHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Generate unique booking reference
const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `IMV-${dateStr}-${randomStr}`;
};

export const createSeatHold = async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { seats, sessionToken } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return errorResponse(res, 'At least one seat must be selected', 400);
    }
    if (seats.length > 10) {
      return errorResponse(res, 'Maximum 10 seats allowed per booking transaction', 400);
    }

    const show = await Show.findById(showId).populate('screen');
    if (!show || show.status !== 'open') {
      return errorResponse(res, 'Show is unavailable or closed for booking', 400);
    }

    // Verify seats belong to screen and are active
    const screenSeats = show.screen?.seatLayout?.seats || [];
    const screenSeatsMap = new Map(screenSeats.map((s) => [s.seatNumber, s]));

    for (const seatNum of seats) {
      const seat = screenSeatsMap.get(seatNum);
      if (!seat || !seat.isActive) {
        return errorResponse(res, `Seat ${seatNum} is invalid or blocked for this screen`, 400);
      }
    }

    // Check if already booked
    const bookedSet = new Set(show.bookedSeats || []);
    for (const seatNum of seats) {
      if (bookedSet.has(seatNum)) {
        return errorResponse(res, `Seat ${seatNum} has already been booked`, 409);
      }
    }

    // Check if held by another session
    const now = new Date();
    const activeConflicts = await SeatHold.find({
      show: show._id,
      seats: { $in: seats },
      status: 'held',
      expiresAt: { $gt: now },
      sessionToken: { $ne: sessionToken }
    });

    if (activeConflicts.length > 0) {
      const conflictSeats = activeConflicts.flatMap((h) => h.seats.filter((s) => seats.includes(s)));
      return errorResponse(
        res,
        `Seats (${conflictSeats.join(', ')}) are currently selected by another customer. Please choose different seats.`,
        409
      );
    }

    // Release any previous hold for this session on this show
    if (sessionToken) {
      await SeatHold.updateMany(
        { show: show._id, sessionToken, status: 'held' },
        { status: 'released' }
      );
    }

    const expiresAt = new Date(Date.now() + config.seatHoldDurationSeconds * 1000);
    const hold = await SeatHold.create({
      show: show._id,
      user: req.user._id,
      seats,
      sessionToken: sessionToken || crypto.randomUUID(),
      expiresAt,
      status: 'held'
    });

    // Broadcast hold via Socket.IO
    broadcastSeatUpdate(show._id.toString(), 'seat-held', {
      seats,
      expiresAt,
      sessionToken: hold.sessionToken
    });

    return successResponse(
      res,
      {
        holdId: hold._id,
        showId: show._id,
        seats,
        sessionToken: hold.sessionToken,
        expiresAt,
        durationSeconds: config.seatHoldDurationSeconds
      },
      'Seats reserved temporarily for checkout',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const releaseSeatHold = async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return errorResponse(res, 'Session token is required', 400);
    }

    const holds = await SeatHold.find({
      show: showId,
      sessionToken,
      status: 'held'
    });

    const releasedSeats = [];
    for (const hold of holds) {
      hold.status = 'released';
      await hold.save();
      releasedSeats.push(...hold.seats);
    }

    if (releasedSeats.length > 0) {
      broadcastSeatUpdate(showId, 'seat-released', {
        seats: releasedSeats,
        reason: 'user_released'
      });
    }

    return successResponse(res, { releasedSeats }, 'Seat hold released');
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, sessionToken } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return errorResponse(res, 'Selected seats are required', 400);
    }

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show || show.status !== 'open') {
      return errorResponse(res, 'Show is not available for booking', 400);
    }

    // Verify valid seat hold for this session
    const now = new Date();
    const activeHold = await SeatHold.findOne({
      show: show._id,
      sessionToken,
      status: 'held',
      expiresAt: { $gt: now }
    });

    if (!activeHold) {
      return errorResponse(
        res,
        'Your seat hold has expired or is invalid. Please select your seats again.',
        410
      );
    }

    // Verify hold contains all requested seats
    const heldSeatsSet = new Set(activeHold.seats);
    for (const seatNum of seats) {
      if (!heldSeatsSet.has(seatNum)) {
        return errorResponse(res, `Seat ${seatNum} is not held in your current reservation session`, 400);
      }
    }

    // Double check that seats are not already booked
    const bookedSet = new Set(show.bookedSeats || []);
    for (const seatNum of seats) {
      if (bookedSet.has(seatNum)) {
        return errorResponse(res, `Seat ${seatNum} has already been confirmed by another booking`, 409);
      }
    }

    // Calculate server-enforced pricing
    const screenSeats = show.screen?.seatLayout?.seats || [];
    const screenSeatsMap = new Map(screenSeats.map((s) => [s.seatNumber, s]));

    let subtotal = 0;
    const seatDetails = seats.map((seatNum) => {
      const seat = screenSeatsMap.get(seatNum);
      const category = seat?.category || 'Standard';
      const priceObj = show.pricing.find((p) => p.category === category);
      const price = priceObj ? priceObj.price : 250;
      subtotal += price;
      return {
        seatNumber: seatNum,
        row: seat?.row || seatNum[0],
        category,
        price
      };
    });

    const convenienceFee = seats.length * 30; // ₹30 per ticket
    const tax = Math.round(convenienceFee * 0.18 * 100) / 100; // 18% GST on convenience fee
    const total = subtotal + convenienceFee + tax;

    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      show: show._id,
      movieSnapshot: {
        title: show.movie.title,
        posterUrl: show.movie.posterUrl,
        certification: show.movie.certification,
        language: show.language,
        format: show.format
      },
      theatreSnapshot: {
        name: show.theatre.name,
        screenName: show.screen.name,
        city: show.theatre.city,
        address: show.theatre.address
      },
      showTime: show.startTime,
      seats: seatDetails,
      priceBreakdown: {
        subtotal,
        convenienceFee,
        tax,
        total
      },
      bookingStatus: 'PENDING',
      paymentStatus: 'PENDING'
    });

    return successResponse(
      res,
      {
        booking: {
          id: booking._id,
          bookingReference: booking.bookingReference,
          priceBreakdown: booking.priceBreakdown,
          seats: booking.seats,
          movie: booking.movieSnapshot,
          theatre: booking.theatreSnapshot,
          showTime: booking.showTime,
          holdExpiresAt: activeHold.expiresAt
        }
      },
      'Booking initialized. Ready for payment.',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status) {
      if (status === 'upcoming') {
        query.bookingStatus = 'CONFIRMED';
        query.showTime = { $gte: new Date() };
      } else if (status === 'past') {
        query.bookingStatus = 'CONFIRMED';
        query.showTime = { $lt: new Date() };
      } else if (status === 'cancelled') {
        query.bookingStatus = 'CANCELLED';
      }
    }

    const bookings = await Booking.find(query).sort('-createdAt');
    return successResponse(res, { bookings }, 'User bookings retrieved');
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Only allow owner or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. You cannot view this booking.', 403);
    }

    // Generate QR code if confirmed and not yet generated
    if (booking.bookingStatus === 'CONFIRMED' && !booking.qrCode) {
      const qrPayload = JSON.stringify({
        ref: booking.bookingReference,
        id: booking._id,
        movie: booking.movieSnapshot.title,
        seats: booking.seats.map((s) => s.seatNumber),
        time: booking.showTime
      });
      booking.qrCode = await QRCode.toDataURL(qrPayload, {
        color: {
          dark: '#007BA7', // Cerulean Blue QR
          light: '#0A0A0A' // Jet Black background
        },
        width: 250,
        margin: 2
      });
      await booking.save();
    }

    return successResponse(res, { booking }, 'Booking retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. You cannot cancel this booking.', 403);
    }

    if (booking.bookingStatus !== 'CONFIRMED') {
      return errorResponse(res, `Cannot cancel booking with status: ${booking.bookingStatus}`, 400);
    }

    // Policy: Cancellation allowed up to 2 hours before show
    const now = new Date();
    const showTime = new Date(booking.showTime);
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return errorResponse(
        res,
        'Cancellation policy: Bookings cannot be cancelled within 2 hours of showtime.',
        400
      );
    }

    // Release seats from the Show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: seatNumbers } }
    });

    // Update booking state
    booking.bookingStatus = 'CANCELLED';
    booking.cancellation = {
      cancelledAt: now,
      reason: req.body.reason || 'User requested cancellation',
      refundStatus: 'COMPLETED',
      refundAmount: booking.priceBreakdown.subtotal // Refund ticket subtotal
    };
    await booking.save();

    // Broadcast seat release to room
    broadcastSeatUpdate(booking.show.toString(), 'seat-released', {
      seats: seatNumbers,
      reason: 'cancellation'
    });

    return successResponse(res, { booking }, 'Booking successfully cancelled and refund initiated.');
  } catch (err) {
    next(err);
  }
};
