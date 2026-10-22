import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/:id', getMovieById);

// Admin-protected endpoints
router.post('/', authenticateUser, authorizeRoles('admin'), createMovie);
router.patch('/:id', authenticateUser, authorizeRoles('admin'), updateMovie);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteMovie);

export default router;
