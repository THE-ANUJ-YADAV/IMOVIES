import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true
    },
    screenNumber: {
      type: Number,
      required: true
    },
    supportedFormats: {
      type: [String],
      default: ['2D', '3D', 'IMAX 2D']
    },
    seatLayout: {
      rows: { type: Number, default: 8 },
      columns: { type: Number, default: 12 },
      seats: [
        {
          seatNumber: { type: String, required: true }, // e.g. "A1"
          row: { type: String, required: true }, // e.g. "A"
          col: { type: Number, required: true }, // e.g. 1
          category: {
            type: String,
            enum: ['Standard', 'Premium', 'Recliner'],
            default: 'Standard'
          },
          isAisle: { type: Boolean, default: false },
          isActive: { type: Boolean, default: true }
        }
      ]
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

screenSchema.pre('save', function (next) {
  if (this.seatLayout && this.seatLayout.seats) {
    this.totalSeats = this.seatLayout.seats.filter((s) => s.isActive).length;
  }
  next();
});

export const Screen = mongoose.model('Screen', screenSchema);
