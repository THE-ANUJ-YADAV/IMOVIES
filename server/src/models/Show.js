import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    language: {
      type: String,
      required: true,
      default: 'English'
    },
    format: {
      type: String,
      required: true,
      default: '2D'
    },
    pricing: [
      {
        category: {
          type: String,
          enum: ['Standard', 'Premium', 'Recliner'],
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    bookedSeats: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['scheduled', 'open', 'closed', 'cancelled'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help query shows by theatre, date, and screen conflict detection
showSchema.index({ screen: 1, startTime: 1, endTime: 1 });
showSchema.index({ movie: 1, startTime: 1 });

export const Show = mongoose.model('Show', showSchema);
