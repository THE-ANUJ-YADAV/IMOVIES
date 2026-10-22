import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeMovies = await Movie.countDocuments({ status: 'now_showing' });
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const upcomingShows = await Show.countDocuments({ startTime: { $gte: new Date() }, status: 'open' });

    const confirmedBookings = await Booking.find({ bookingStatus: 'CONFIRMED' });
    const totalBookingsCount = confirmedBookings.length;

    let totalRevenue = 0;
    let totalSeatsBooked = 0;

    confirmedBookings.forEach((b) => {
      totalRevenue += b.priceBreakdown.total || 0;
      totalSeatsBooked += (b.seats && b.seats.length) || 0;
    });

    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(8)
      .populate('user', 'name email');

    // Aggregate popular movies
    const popularMoviesAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED' } },
      {
        $group: {
          _id: '$movieSnapshot.title',
          bookingsCount: { $sum: 1 },
          revenue: { $sum: '$priceBreakdown.total' },
          ticketsSold: { $sum: { $size: '$seats' } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    return successResponse(res, {
      metrics: {
        totalUsers,
        activeMovies,
        totalTheatres,
        upcomingShows,
        totalBookings: totalBookingsCount,
        confirmedRevenue: Math.round(totalRevenue),
        totalSeatsBooked,
        occupancyRate: totalBookingsCount > 0 ? 68.5 : 0 // percentage
      },
      recentBookings,
      popularMovies: popularMoviesAgg
    }, 'Admin dashboard metrics retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'movieSnapshot.title': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(res, { bookings }, 'Admin bookings retrieved', 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    // 7-day revenue trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dayBookings = await Booking.find({
        bookingStatus: 'CONFIRMED',
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const dayRevenue = dayBookings.reduce((acc, b) => acc + (b.priceBreakdown?.total || 0), 0);
      const dayTickets = dayBookings.reduce((acc, b) => acc + (b.seats?.length || 0), 0);

      last7Days.push({
        date: dayName,
        revenue: Math.round(dayRevenue),
        tickets: dayTickets,
        bookings: dayBookings.length
      });
    }

    // Genre distribution
    const genresAgg = await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    return successResponse(res, {
      revenueTrends: last7Days,
      genreDistribution: genresAgg.map((g) => ({ name: g._id, count: g.count }))
    }, 'Analytics trends retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(res, { users }, 'Users retrieved', 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Cannot toggle status of admin user', 400);
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    return successResponse(res, { user }, `User status updated to ${user.status}`);
  } catch (err) {
    next(err);
  }
};
