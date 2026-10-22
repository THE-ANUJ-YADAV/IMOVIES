import mongoose from 'mongoose';

const seatHoldSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    seats: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, 'At least one seat must be selected']
    },
    sessionToken: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['held', 'released', 'confirmed', 'expired'],
      default: 'held'
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically purge old records after 1 hour (though our application checks expiresAt actively)
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
seatHoldSchema.index({ show: 1, status: 1 });

export const SeatHold = mongoose.model('SeatHold', seatHoldSchema);
