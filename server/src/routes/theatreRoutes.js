import express from 'express';
import {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen
} from '../controllers/theatreController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/screens', getScreens);
router.get('/:id', getTheatreById);

// Admin-protected endpoints
router.post('/', authenticateUser, authorizeRoles('admin'), createTheatre);
router.patch('/:id', authenticateUser, authorizeRoles('admin'), updateTheatre);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteTheatre);

router.post('/screens', authenticateUser, authorizeRoles('admin'), createScreen);
router.patch('/screens/:id', authenticateUser, authorizeRoles('admin'), updateScreen);
router.delete('/screens/:id', authenticateUser, authorizeRoles('admin'), deleteScreen);

export default router;
