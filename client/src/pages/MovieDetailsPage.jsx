import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, Clock, Calendar, Play, Film, Share2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ShowtimeSelector from '../components/movies/ShowtimeSelector';
import TrailerModal from '../components/movies/TrailerModal';

export const MovieDetailsPage = () => {
  const { id } = useParams();
  const { selectedCity } = useSelector((state) => state.city);

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data.movie);
        setShows(res.data.shows || []);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-jet flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cerulean border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Film className="w-12 h-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <Link to="/movies" className="text-cerulean text-sm font-semibold hover:underline">
          Back to all movies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Cinematic Movie Backdrop Header */}
      <div className="relative min-h-[460px] lg:min-h-[520px] w-full flex items-end overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-jet via-jet/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-jet via-transparent to-transparent" />
        </div>

        {/* Content Inside Backdrop */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <Link
            to="/movies"
            className="inline-flex items-center space-x-1.5 text-xs text-muted hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movies</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Poster Card */}
            <div className="relative w-44 sm:w-56 rounded-2xl overflow-hidden border border-border shadow-2xl flex-shrink-0 bg-card">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/70 backdrop-blur-md text-white border border-white/10">
                {movie.certification}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {movie.formats?.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-cerulean/20 text-cerulean border border-cerulean/30"
                  >
                    {fmt}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {movie.title}
              </h1>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                {movie.rating?.score && (
                  <div className="flex items-center space-x-1 text-warning font-bold">
                    <Star className="w-4 h-4 fill-warning" />
                    <span>{movie.rating.score.toFixed(1)} / 10</span>
                    <span className="text-xs text-muted">({movie.rating.votes} votes)</span>
                  </div>
                )}
                <span>•</span>
                <span className="flex items-center text-white">
                  <Clock className="w-4 h-4 mr-1 text-muted" />
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span>•</span>
                <span className="text-white">{movie.languages?.join(', ')}</span>
                <span>•</span>
                <span className="text-white">{movie.genres?.join(', ')}</span>
              </div>

              {/* Trailer Action */}
              {movie.trailerUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-card/90 hover:bg-elevated border border-border hover:border-cerulean text-white text-xs font-bold flex items-center space-x-2 transition-all backdrop-blur-md shadow-md"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Official Trailer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Showtimes Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Synopsis, Cast & Crew */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border pb-3">
              About the Movie
            </h3>
            <p className="text-sm text-[#D4D4D4] leading-relaxed">{movie.synopsis}</p>
          </div>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-border pb-3">Cast</h3>
              <div className="space-y-3">
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-xs font-bold text-white uppercase">
                      {actor.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{actor.name}</h4>
                      <p className="text-xs text-muted">{actor.role || 'Actor'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crew */}
          {movie.crew && movie.crew.length > 0 && (
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-border pb-3">Crew</h3>
              <div className="space-y-2 text-sm">
                {movie.crew.map((member, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted">{member.role}</span>
                    <span className="font-semibold text-white">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Showtime Booking Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Select Date & Showtimes</h2>
              <p className="text-xs text-muted mt-1">Showing available screens in {selectedCity}</p>
            </div>
          </div>

          {/* Showtimes Selector Component */}
          <ShowtimeSelector shows={shows} selectedCity={selectedCity} />
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetailsPage;
