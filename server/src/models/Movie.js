import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required']
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required']
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genres: {
      type: [String],
      required: true,
      default: []
    },
    languages: {
      type: [String],
      required: true,
      default: []
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA'
    },
    cast: [
      {
        name: String,
        role: String,
        image: String
      }
    ],
    crew: [
      {
        name: String,
        role: String
      }
    ],
    rating: {
      score: { type: Number, default: 8.5 },
      votes: { type: Number, default: 120 }
    },
    formats: {
      type: [String],
      default: ['2D', '3D', 'IMAX 2D']
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'now_showing'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

movieSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

export const Movie = mongoose.model('Movie', movieSchema);
