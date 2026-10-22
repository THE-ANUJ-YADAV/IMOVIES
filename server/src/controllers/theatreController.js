import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const theatres = await Theatre.find(query).populate('screens', 'name screenNumber totalSeats supportedFormats');
    return successResponse(res, { theatres }, 'Theatres retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('screens');
    if (!theatre) {
      return errorResponse(res, 'Theatre not found', 404);
    }

    const upcomingShows = await Show.find({
      theatre: theatre._id,
      startTime: { $gte: new Date() },
      status: 'open'
    })
      .populate('movie', 'title posterUrl duration certification languages formats')
      .populate('screen', 'name screenNumber')
      .sort('startTime');

    return successResponse(res, { theatre, shows: upcomingShows }, 'Theatre details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    return successResponse(res, { theatre }, 'Theatre created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!theatre) {
      return errorResponse(res, 'Theatre not found', 404);
    }
    return successResponse(res, { theatre }, 'Theatre updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return errorResponse(res, 'Theatre not found', 404);
    }
    return successResponse(res, {}, 'Theatre deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Screen Controller methods
export const getScreens = async (req, res, next) => {
  try {
    const { theatreId } = req.query;
    const query = {};
    if (theatreId) query.theatre = theatreId;

    const screens = await Screen.find(query).populate('theatre', 'name city');
    return successResponse(res, { screens }, 'Screens retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const { theatre, name, screenNumber, supportedFormats, seatLayout } = req.body;
    
    // Default standard cinema layout if not passed
    let finalLayout = seatLayout;
    if (!finalLayout || !finalLayout.seats || finalLayout.seats.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const cols = 12;
      const seats = [];
      
      rows.forEach((rowLetter, rIndex) => {
        let category = 'Standard';
        if (rIndex >= 6) category = 'Recliner';
        else if (rIndex >= 3) category = 'Premium';

        for (let c = 1; c <= cols; c++) {
          seats.push({
            seatNumber: `${rowLetter}${c}`,
            row: rowLetter,
            col: c,
            category,
            isAisle: c === 4 || c === 9,
            isActive: true
          });
        }
      });
      finalLayout = { rows: rows.length, columns: cols, seats };
    }

    const screen = await Screen.create({
      theatre,
      name,
      screenNumber,
      supportedFormats: supportedFormats || ['2D', '3D', 'IMAX 2D'],
      seatLayout: finalLayout
    });

    // Add reference to theatre
    await Theatre.findByIdAndUpdate(theatre, { $push: { screens: screen._id } });

    return successResponse(res, { screen }, 'Screen created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!screen) {
      return errorResponse(res, 'Screen not found', 404);
    }
    return successResponse(res, { screen }, 'Screen updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return errorResponse(res, 'Screen not found', 404);
    }
    await Theatre.findByIdAndUpdate(screen.theatre, { $pull: { screens: screen._id } });
    return successResponse(res, {}, 'Screen deleted successfully');
  } catch (err) {
    next(err);
  }
};
