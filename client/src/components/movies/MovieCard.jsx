import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    if (!mins) return '';
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m}m`;
  };

  return (
    <div className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-cerulean/60 transition-all duration-300 hover:shadow-cerulean flex flex-col justify-between">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-elevated">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark subtle overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {movie.isFeatured && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-neon text-white shadow-rose tracking-wider">
              Featured
            </span>
          )}
          {movie.isTrending && !movie.isFeatured && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cerulean text-white shadow-cerulean tracking-wider">
              Trending
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase">
            {movie.certification || 'UA'}
          </span>
        </div>

        {/* Rating Badge */}
        {movie.rating?.score && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-warning">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="text-white">{movie.rating.score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-cerulean-light transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <div className="flex items-center space-x-2 text-xs text-muted mt-1">
            <span className="line-clamp-1">{movie.genres?.join(', ')}</span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(movie.duration)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 mt-2">
            {movie.formats?.slice(0, 3).map((fmt) => (
              <span
                key={fmt}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated border border-border text-white"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/movies/${movie._id}`}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-cerulean"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>{movie.status === 'coming_soon' ? 'View Details' : 'Book Tickets'}</span>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
