import express from 'express';
import {
  getDashboardMetrics,
  getAdminBookings,
  getAdminAnalytics,
  getAdminUsers,
  toggleUserStatus
} from '../controllers/adminController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser, authorizeRoles('admin'));

router.get('/dashboard', getDashboardMetrics);
router.get('/bookings', getAdminBookings);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

export default router;
