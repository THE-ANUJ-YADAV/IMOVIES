import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      format,
      status,
      city,
      isFeatured,
      isTrending,
      sort = '-releaseDate',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (genre) {
      query.genres = { $in: [genre] };
    }
    if (language) {
      query.languages = { $in: [language] };
    }
    if (format) {
      query.formats = { $in: [format] };
    }
    if (status) {
      query.status = status;
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    if (isTrending !== undefined) {
      query.isTrending = isTrending === 'true';
    }

    // Filter by city if provided
    if (city) {
      const theatresInCity = await Theatre.find({ city: { $regex: city, $options: 'i' }, isActive: true }).select('_id');
      const theatreIds = theatresInCity.map((t) => t._id);
      const activeShows = await Show.find({
        theatre: { $in: theatreIds },
        startTime: { $gte: new Date() },
        status: 'open'
      }).distinct('movie');
      query._id = { $in: activeShows };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    return successResponse(res, { movies }, 'Movies retrieved successfully', 200, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      limit: parseInt(limit, 10)
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return errorResponse(res, 'Movie not found', 404);
    }

    // Also fetch available cities and theatres with upcoming shows for this movie
    const upcomingShows = await Show.find({
      movie: movie._id,
      startTime: { $gte: new Date() },
      status: 'open'
    })
      .populate('theatre', 'name city address facilities')
      .populate('screen', 'name screenNumber supportedFormats')
      .sort('startTime');

    return successResponse(res, { movie, shows: upcomingShows }, 'Movie details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    return successResponse(res, { movie }, 'Movie created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!movie) {
      return errorResponse(res, 'Movie not found', 404);
    }
    return successResponse(res, { movie }, 'Movie updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return errorResponse(res, 'Movie not found', 404);
    }
    return successResponse(res, {}, 'Movie deleted successfully');
  } catch (err) {
    next(err);
  }
};
