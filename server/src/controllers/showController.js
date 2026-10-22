import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { SeatHold } from '../models/SeatHold.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, date, city } = req.query;
    const query = { status: 'open' };

    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      query.startTime = { $gte: new Date() };
    }

    let shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration certification formats languages')
      .populate('theatre', 'name city address facilities')
      .populate('screen', 'name screenNumber supportedFormats')
      .sort('startTime');

    if (city) {
      shows = shows.filter(
        (show) => show.theatre && show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    return successResponse(res, { shows }, 'Shows retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!show) {
      return errorResponse(res, 'Show not found', 404);
    }

    return successResponse(res, { show }, 'Show details retrieved');
  } catch (err) {
    next(err);
  }
};

export const getShowSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title duration certification')
      .populate('theatre', 'name city address')
      .populate('screen');

    if (!show) {
      return errorResponse(res, 'Show not found', 404);
    }

    const { sessionToken } = req.query;

    // Active holds: not expired and status === 'held'
    const now = new Date();
    const activeHolds = await SeatHold.find({
      show: show._id,
      status: 'held',
      expiresAt: { $gt: now }
    });

    const heldSeatsMap = new Map();
    activeHolds.forEach((hold) => {
      const isMyHold = sessionToken && hold.sessionToken === sessionToken;
      hold.seats.forEach((seatNum) => {
        heldSeatsMap.set(seatNum, {
          isMyHold,
          expiresAt: hold.expiresAt
        });
      });
    });

    const bookedSeatsSet = new Set(show.bookedSeats || []);

    // Construct seat status matrix
    const screenSeats = show.screen?.seatLayout?.seats || [];
    const seatMap = screenSeats.map((seat) => {
      let state = 'AVAILABLE';

      if (!seat.isActive) {
        state = 'BLOCKED';
      } else if (bookedSeatsSet.has(seat.seatNumber)) {
        state = 'BOOKED';
      } else if (heldSeatsMap.has(seat.seatNumber)) {
        const holdInfo = heldSeatsMap.get(seat.seatNumber);
        state = holdInfo.isMyHold ? 'HELD_BY_ME' : 'HELD';
      }

      // Find price for this category from show.pricing
      const priceObj = show.pricing.find((p) => p.category === seat.category);
      const price = priceObj ? priceObj.price : 200;

      return {
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        category: seat.category,
        isAisle: seat.isAisle,
        price,
        state
      };
    });

    return successResponse(
      res,
      {
        show: {
          id: show._id,
          movie: show.movie,
          theatre: show.theatre,
          screen: {
            id: show.screen._id,
            name: show.screen.name,
            rows: show.screen.seatLayout.rows,
            columns: show.screen.seatLayout.columns
          },
          startTime: show.startTime,
          endTime: show.endTime,
          language: show.language,
          format: show.format,
          pricing: show.pricing
        },
        seats: seatMap
      },
      'Seat map retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const { movie, theatre, screen, startTime, endTime, language, format, pricing } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return errorResponse(res, 'Show start time must be before end time', 400);
    }

    // Check for overlapping shows on the same screen
    const conflict = await Show.findOne({
      screen,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (conflict) {
      return errorResponse(
        res,
        'Scheduling conflict: Another show is already scheduled in this screen for the selected time window.',
        409
      );
    }

    const show = await Show.create({
      movie,
      theatre,
      screen,
      startTime: start,
      endTime: end,
      language,
      format,
      pricing
    });

    return successResponse(res, { show }, 'Show scheduled successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateShow = async (req, res, next) => {
  try {
    const { startTime, endTime, screen } = req.body;
    const showId = req.params.id;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const targetScreen = screen || (await Show.findById(showId)).screen;
      const conflict = await Show.findOne({
        _id: { $ne: showId },
        screen: targetScreen,
        status: { $ne: 'cancelled' },
        $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
      });

      if (conflict) {
        return errorResponse(res, 'Scheduling conflict with an existing show', 409);
      }
    }

    const show = await Show.findByIdAndUpdate(showId, req.body, {
      new: true,
      runValidators: true
    });

    if (!show) {
      return errorResponse(res, 'Show not found', 404);
    }

    return successResponse(res, { show }, 'Show updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!show) {
      return errorResponse(res, 'Show not found', 404);
    }
    return successResponse(res, {}, 'Show cancelled successfully');
  } catch (err) {
    next(err);
  }
};
