import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    state: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food Court', 'Parking', 'Wheelchair Access']
    },
    screens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

theatreSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = (this.name + '-' + this.city)
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

export const Theatre = mongoose.model('Theatre', theatreSchema);
