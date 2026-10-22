import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Filter, SlidersHorizontal, Film, RotateCcw } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/movies/MovieCard';

export const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useSelector((state) => state.city);

  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('-releaseDate');

  const genres = ['Action', 'Adventure', 'Sci-Fi', 'Drama', 'Biography', 'Animation', 'Comedy'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu'];
  const formats = ['IMAX 2D', '2D', '3D', '4DX'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedGenre) params.append('genre', selectedGenre);
        if (selectedLanguage) params.append('language', selectedLanguage);
        if (selectedFormat) params.append('format', selectedFormat);
        if (selectedStatus) params.append('status', selectedStatus);
        if (sortBy) params.append('sort', sortBy);

        const res = await api.get(`/movies?${params.toString()}`);
        setMovies(res.data.movies || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, selectedFormat, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedFormat('');
    setSelectedStatus('');
    setSortBy('-releaseDate');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Explore Movies</h1>
          <p className="text-sm text-muted mt-1">
            Browse through current releases, coming soon titles, and special formats
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search movie title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-white placeholder-muted focus:outline-none focus:border-cerulean transition-all"
          />
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <SlidersHorizontal className="w-4 h-4 text-cerulean" />
            <span>Filters</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-elevated border border-border text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cerulean"
            >
              <option value="-releaseDate">Latest Releases</option>
              <option value="-rating.score">Top Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration">Shortest Duration</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs text-muted hover:text-white px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Status */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-elevated border border-border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cerulean"
            >
              <option value="">All Statuses</option>
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted block mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-elevated border border-border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cerulean"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted block mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-elevated border border-border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cerulean"
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="text-[11px] font-bold uppercase text-muted block mb-1">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full bg-elevated border border-border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cerulean"
            >
              <option value="">All Formats</option>
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="aspect-[2/3] bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-card border border-border space-y-3">
          <Film className="w-12 h-12 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Match Your Filters</h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Try resetting your active filters or searching for another title.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-cerulean text-white text-xs font-bold hover:bg-cerulean-hover transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
