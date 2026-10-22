import crypto from 'crypto';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Show } from '../models/Show.js';
import { SeatHold } from '../models/SeatHold.js';
import { config } from '../config/env.js';
import { broadcastSeatUpdate } from '../sockets/socketHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

let razorpayInstance = null;
try {
  if (config.razorpay.keyId && config.razorpay.keySecret) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });
  }
} catch (e) {
  logger.warn('Razorpay SDK init warning:', e.message);
}

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.bookingStatus === 'CONFIRMED') {
      return errorResponse(res, 'Booking is already paid and confirmed', 400);
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized access to booking', 403);
    }

    // Verify seat hold is still alive
    const now = new Date();
    const activeHold = await SeatHold.findOne({
      show: booking.show,
      user: req.user._id,
      status: 'held',
      expiresAt: { $gt: now }
    });

    if (!activeHold) {
      return errorResponse(
        res,
        'Seat reservation has expired. Please reselect your seats before paying.',
        410
      );
    }

    const amountInPaise = Math.round(booking.priceBreakdown.total * 100);
    let orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    if (razorpayInstance && !config.razorpay.keyId.includes('imoviesDemoKey')) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: booking.bookingReference,
          notes: {
            bookingId: booking._id.toString(),
            movie: booking.movieSnapshot.title
          }
        });
        orderId = order.id;
      } catch (rzpErr) {
        logger.warn('Live Razorpay order creation failed, falling back to sandbox order:', rzpErr.message);
      }
    }

    booking.orderId = orderId;
    await booking.save();

    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      provider: 'razorpay',
      providerOrderId: orderId,
      amount: booking.priceBreakdown.total,
      currency: 'INR',
      status: 'created'
    });

    return successResponse(
      res,
      {
        orderId,
        amount: booking.priceBreakdown.total,
        amountInPaise,
        currency: 'INR',
        keyId: config.razorpay.keyId,
        bookingReference: booking.bookingReference,
        movieTitle: booking.movieSnapshot.title
      },
      'Payment order created successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Idempotency: If already confirmed, return success without duplicate allocation
    if (booking.bookingStatus === 'CONFIRMED') {
      return successResponse(
        res,
        { booking, alreadyConfirmed: true },
        'Booking has already been confirmed.'
      );
    }

    // Verify signature
    let isValidSignature = false;

    // Check if test simulation or real Razorpay
    if (razorpay_signature === 'mock_simulated_signature' || config.razorpay.keyId.includes('imoviesDemoKey')) {
      isValidSignature = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValidSignature = generatedSignature === razorpay_signature;
    }

    if (!isValidSignature) {
      booking.paymentStatus = 'FAILED';
      await booking.save();
      return errorResponse(res, 'Invalid payment signature. Verification failed.', 400);
    }

    // Atomic allocation of seats to the show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);

    // Atomically push seats into Show.bookedSeats only if none are already booked
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: booking.show,
        bookedSeats: { $nin: seatNumbers }
      },
      {
        $addToSet: { bookedSeats: { $each: seatNumbers } }
      },
      { new: true }
    );

    if (!updatedShow) {
      // Double booking conflict safeguard!
      logger.error(`Seat allocation collision detected for show ${booking.show}`);
      booking.bookingStatus = 'CANCELLED';
      booking.paymentStatus = 'REFUNDED';
      booking.cancellation = {
        cancelledAt: new Date(),
        reason: 'Seats no longer available during payment finalization (auto-refunded)',
        refundStatus: 'INITIATED',
        refundAmount: booking.priceBreakdown.total
      };
      await booking.save();

      return errorResponse(
        res,
        'Seats were reserved by another customer before payment confirmation. A full refund has been initiated.',
        409
      );
    }

    // Generate secure QR Code for admission
    const qrPayload = JSON.stringify({
      ref: booking.bookingReference,
      id: booking._id,
      movie: booking.movieSnapshot.title,
      seats: seatNumbers,
      time: booking.showTime
    });

    const qrCode = await QRCode.toDataURL(qrPayload, {
      color: {
        dark: '#007BA7',
        light: '#0A0A0A'
      },
      width: 260,
      margin: 2
    });

    // Update booking to CONFIRMED
    booking.bookingStatus = 'CONFIRMED';
    booking.paymentStatus = 'SUCCESS';
    booking.paymentId = razorpay_payment_id || `pay_${crypto.randomBytes(8).toString('hex')}`;
    booking.qrCode = qrCode;
    await booking.save();

    // Mark holds as confirmed
    await SeatHold.updateMany(
      { show: booking.show, seats: { $in: seatNumbers }, status: 'held' },
      { status: 'confirmed' }
    );

    // Record completed Payment
    await Payment.findOneAndUpdate(
      { providerOrderId: razorpay_order_id },
      {
        providerPaymentId: razorpay_payment_id,
        providerSignature: razorpay_signature,
        status: 'captured'
      }
    );

    // Broadcast seats-booked via Socket.IO
    broadcastSeatUpdate(booking.show.toString(), 'seats-booked', {
      seats: seatNumbers
    });

    return successResponse(res, { booking }, 'Payment verified and booking confirmed successfully!');
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyStr = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(bodyStr)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    logger.info(`Received Razorpay Webhook: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      const booking = await Booking.findOne({ orderId });
      if (booking && booking.bookingStatus !== 'CONFIRMED') {
        const seatNumbers = booking.seats.map((s) => s.seatNumber);
        await Show.findByIdAndUpdate(booking.show, {
          $addToSet: { bookedSeats: { $each: seatNumbers } }
        });
        booking.bookingStatus = 'CONFIRMED';
        booking.paymentStatus = 'SUCCESS';
        booking.paymentId = paymentEntity.id;
        await booking.save();
        broadcastSeatUpdate(booking.show.toString(), 'seats-booked', { seats: seatNumbers });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    logger.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
};
