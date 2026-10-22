import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building, MapPin, Search, ChevronRight, Check } from 'lucide-react';
import api from '../services/api';

export const TheatresPage = () => {
  const { selectedCity } = useSelector((state) => state.city);
  const [theatres, setTheatres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/theatres?city=${encodeURIComponent(selectedCity)}&search=${encodeURIComponent(search)}`);
        setTheatres(res.data.theatres || []);
      } catch (err) {
        console.error('Error fetching theatres:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Cinemas in {selectedCity}</h1>
          <p className="text-sm text-muted mt-1">
            Browse premium auditoriums, IMAX theatres, and luxury dine-in movie destinations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search theatre name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-white placeholder-muted focus:outline-none focus:border-cerulean transition-all"
          />
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Theatres Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : theatres.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-card border border-border space-y-3">
          <Building className="w-12 h-12 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No Theatres Found in {selectedCity}</h3>
          <p className="text-sm text-muted">
            Try switching to another city from the top navigation bar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((theatre) => (
            <Link
              key={theatre._id}
              to={`/theatres/${theatre._id}`}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cerulean transition-all hover:shadow-cerulean flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-cerulean-light transition-colors">
                    {theatre.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-cerulean group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 text-rose-neon" />
                  <span>{theatre.address}, {theatre.city}</span>
                </div>
              </div>

              {/* Screens and Facilities */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="text-xs text-muted">
                  Screens Available:{' '}
                  <span className="font-bold text-white">
                    {theatre.screens?.length || 2} Screens
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {theatre.facilities?.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-elevated text-muted border border-border"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
