import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    movieSnapshot: {
      title: { type: String, required: true },
      posterUrl: { type: String, required: true },
      certification: { type: String, default: 'UA' },
      language: { type: String, default: 'English' },
      format: { type: String, default: '2D' }
    },
    theatreSnapshot: {
      name: { type: String, required: true },
      screenName: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true }
    },
    showTime: {
      type: Date,
      required: true
    },
    seats: [
      {
        seatNumber: { type: String, required: true },
        row: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    priceBreakdown: {
      subtotal: { type: Number, required: true },
      convenienceFee: { type: Number, required: true, default: 30 },
      tax: { type: Number, required: true, default: 5.4 },
      total: { type: Number, required: true }
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    paymentId: {
      type: String,
      default: ''
    },
    orderId: {
      type: String,
      default: ''
    },
    qrCode: {
      type: String, // Data URI containing ticket verification token
      default: ''
    },
    cancellation: {
      cancelledAt: Date,
      reason: String,
      refundStatus: {
        type: String,
        enum: ['NONE', 'INITIATED', 'COMPLETED', 'FAILED'],
        default: 'NONE'
      },
      refundAmount: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
