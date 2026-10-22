import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
} from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/webhook', handleWebhook);

router.post('/create-order', authenticateUser, createPaymentOrder);
router.post('/verify', authenticateUser, verifyPayment);

export default router;
