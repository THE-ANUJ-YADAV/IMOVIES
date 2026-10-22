import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, Film, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ShowtimeSelector from '../components/movies/ShowtimeSelector';

export const TheatreDetailsPage = () => {
  const { id } = useParams();
  const [theatre, setTheatre] = useState(null);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTheatreDetails = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/theatres/${id}`);
        setTheatre(res.data.theatre);
        setShows(res.data.shows || []);
      } catch (err) {
        console.error('Error fetching theatre details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheatreDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-jet flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cerulean border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!theatre) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Building className="w-12 h-12 text-muted mx-auto" />
        <h2 className="text-xl font-bold text-white">Cinema Not Found</h2>
        <Link to="/theatres" className="text-cerulean text-sm font-semibold hover:underline">
          Back to all theatres
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        to="/theatres"
        className="inline-flex items-center space-x-1.5 text-xs text-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Theatres</span>
      </Link>

      {/* Theatre Info Card */}
      <div className="p-8 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{theatre.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-muted">
              <MapPin className="w-4 h-4 text-rose-neon" />
              <span>{theatre.address}, {theatre.city}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {theatre.facilities?.map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-elevated text-white border border-border"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Shows Scheduled */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Currently Showing</h2>
          <p className="text-xs text-muted mt-1">Select showtime to proceed with seat booking</p>
        </div>

        <ShowtimeSelector shows={shows} selectedCity={theatre.city} />
      </div>
    </div>
  );
};

export default TheatreDetailsPage;
