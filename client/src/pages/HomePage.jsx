import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, Ticket, Star, Clock, ChevronRight, Sparkles, Building, Film } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import TrailerModal from '../components/movies/TrailerModal';

export const HomePage = () => {
  const { selectedCity } = useSelector((state) => state.city);

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [moviesRes, theatresRes] = await Promise.all([
          api.get('/movies'),
          api.get(`/theatres?city=${encodeURIComponent(selectedCity)}`)
        ]);

        const allMovies = moviesRes.data.movies || [];
        setMovies(allMovies);

        // Pick featured movie for hero
        const featured = allMovies.find((m) => m.isFeatured) || allMovies[0];
        setFeaturedMovie(featured);

        setTheatres(theatresRes.data.theatres || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  const genres = ['ALL', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Biography', 'Animation'];

  const nowShowing = movies.filter((m) => {
    const matchesStatus = m.status === 'now_showing';
    const matchesGenre = selectedGenre === 'ALL' || m.genres.includes(selectedGenre);
    return matchesStatus && matchesGenre;
  });

  const comingSoon = movies.filter((m) => m.status === 'coming_soon');
  const trending = movies.filter((m) => m.isTrending);

  return (
    <div className="space-y-16">
      {/* Cinematic Hero Section */}
      {featuredMovie && (
        <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-50"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-jet via-jet/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-jet via-jet/70 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl space-y-5">
              {/* Promotional Highlight Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-neon/15 border border-rose-neon/40 text-rose-neon text-xs font-extrabold tracking-wider uppercase shadow-rose">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Experience of the Month</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {featuredMovie.title}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                {featuredMovie.rating?.score && (
                  <div className="flex items-center space-x-1 text-warning font-bold">
                    <Star className="w-4 h-4 fill-warning" />
                    <span>{featuredMovie.rating.score.toFixed(1)} Rating</span>
                  </div>
                )}
                <span>•</span>
                <span className="flex items-center text-white">
                  <Clock className="w-4 h-4 mr-1 text-muted" />
                  {Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m
                </span>
                <span>•</span>
                <span className="text-white font-medium">{featuredMovie.genres?.join(', ')}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-white border border-white/20">
                  {featuredMovie.certification}
                </span>
              </div>

              {/* Synopsis */}
              <p className="text-base text-[#D4D4D4] leading-relaxed line-clamp-3">
                {featuredMovie.synopsis}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to={`/movies/${featuredMovie._id}`}
                  className="px-8 py-3.5 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center space-x-2 transition-all shadow-cerulean hover:scale-105"
                >
                  <Ticket className="w-5 h-5" />
                  <span>Book Tickets Now</span>
                </Link>

                {featuredMovie.trailerUrl && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-card/80 hover:bg-elevated border border-border hover:border-cerulean text-white text-sm font-bold flex items-center space-x-2 transition-all backdrop-blur-md"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Genre Pill Filter Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white flex items-center">
              <Film className="w-5 h-5 text-cerulean mr-2" />
              <span>Explore by Genre</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedGenre === genre
                    ? 'bg-cerulean text-white shadow-cerulean'
                    : 'bg-card text-muted hover:text-white border border-border hover:border-cerulean/40'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* Now Showing Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Now Showing in {selectedCity}</h2>
              <p className="text-xs text-muted mt-0.5">Catch the latest blockbuster releases today</p>
            </div>
            <Link
              to="/movies"
              className="text-xs font-bold text-cerulean hover:text-cerulean-light flex items-center space-x-1"
            >
              <span>View All Movies</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : nowShowing.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-2">
              <Film className="w-10 h-10 text-muted mx-auto" />
              <h3 className="text-base font-bold text-white">No Movies Found</h3>
              <p className="text-xs text-muted">Try selecting a different genre above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {nowShowing.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Highlights */}
        {trending.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center">
                  <span>Trending Movies</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-neon text-white shadow-rose">
                    Popular
                  </span>
                </h2>
                <p className="text-xs text-muted mt-0.5">Audience favorites with highest bookings</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {trending.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Coming Soon to Cinemas</h2>
                <p className="text-xs text-muted mt-0.5">Stay ahead and explore upcoming titles</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {comingSoon.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Theatres in City */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center">
                <Building className="w-5 h-5 text-rose-neon mr-2" />
                <span>Featured Cinemas in {selectedCity}</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">Premium projection, acoustics and recliner lounges</p>
            </div>
            <Link
              to="/theatres"
              className="text-xs font-bold text-cerulean hover:text-cerulean-light flex items-center space-x-1"
            >
              <span>All Theatres</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {theatres.map((theatre) => (
              <Link
                key={theatre._id}
                to={`/theatres/${theatre._id}`}
                className="group p-5 rounded-2xl bg-card border border-border hover:border-cerulean/60 transition-all hover:shadow-cerulean flex flex-col justify-between space-y-4"
              >
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-cerulean-light transition-colors">
                    {theatre.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 truncate">{theatre.address}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                  {theatre.facilities?.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded text-[10px] bg-elevated text-muted border border-border"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {featuredMovie && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={featuredMovie.trailerUrl}
          movieTitle={featuredMovie.title}
        />
      )}
    </div>
  );
};

export default HomePage;
