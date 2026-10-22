import express from 'express';
import {
  getShows,
  getShowById,
  getShowSeats,
  createShow,
  updateShow,
  deleteShow
} from '../controllers/showController.js';
import {
  createSeatHold,
  releaseSeatHold
} from '../controllers/bookingController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:id', getShowById);
router.get('/:id/seats', getShowSeats);

// Seat holds on a show
router.post('/:id/holds', authenticateUser, createSeatHold);
router.delete('/:id/holds', authenticateUser, releaseSeatHold);

// Admin show management
router.post('/', authenticateUser, authorizeRoles('admin'), createShow);
router.patch('/:id', authenticateUser, authorizeRoles('admin'), updateShow);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteShow);

export default router;
