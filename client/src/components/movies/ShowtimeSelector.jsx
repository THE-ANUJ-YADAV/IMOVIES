import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

export const ShowtimeSelector = ({ shows = [], selectedCity = 'Mumbai' }) => {
  const navigate = useNavigate();

  // Generate next 4 calendar dates
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    });
  }

  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);

  // Filter shows by selected date and city
  const filteredShows = shows.filter((show) => {
    const showDateStr = new Date(show.startTime).toISOString().split('T')[0];
    const cityMatches =
      !selectedCity ||
      (show.theatre?.city && show.theatre.city.toLowerCase() === selectedCity.toLowerCase());
    return showDateStr === selectedDate && cityMatches;
  });

  // Group shows by Theatre
  const showsByTheatre = filteredShows.reduce((acc, show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  const handleSelectShow = (showId) => {
    navigate(`/shows/${showId}/seats`);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Tabs */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-cerulean border-cerulean text-white shadow-cerulean'
                  : 'bg-card border-border text-muted hover:border-cerulean/50 hover:text-white'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {item.dayName}
              </span>
              <span className="text-lg font-extrabold text-white">{item.dayNumber}</span>
              <span className="text-[10px] font-medium">{item.month}</span>
            </button>
          );
        })}
      </div>

      {/* Theatres and Showtimes */}
      {Object.keys(showsByTheatre).length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center space-y-3">
          <Calendar className="w-10 h-10 text-muted mx-auto" />
          <h4 className="text-base font-bold text-white">No Shows Scheduled</h4>
          <p className="text-sm text-muted max-w-md mx-auto">
            There are no shows available on this date for {selectedCity}. Try selecting a different date or city from the navbar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
            <div
              key={theatre._id}
              className="p-5 rounded-2xl bg-card border border-border space-y-4 hover:border-cerulean/40 transition-all"
            >
              {/* Theatre Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center">
                    {theatre.name}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cerulean/15 text-cerulean border border-cerulean/30 uppercase">
                      Verified Cinema
                    </span>
                  </h4>
                  <div className="flex items-center space-x-1.5 text-xs text-muted mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-neon" />
                    <span>{theatre.address}, {theatre.city}</span>
                  </div>
                </div>

                {/* Facilities */}
                {theatre.facilities && theatre.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.facilities.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded bg-elevated text-[11px] text-muted border border-border"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Showtimes Pill Grid */}
              <div className="flex flex-wrap gap-3 items-center">
                {tShows.map((show) => {
                  const minPrice =
                    show.pricing && show.pricing.length > 0
                      ? Math.min(...show.pricing.map((p) => p.price))
                      : 250;

                  return (
                    <button
                      key={show._id}
                      onClick={() => handleSelectShow(show._id)}
                      className="group/btn relative px-4 py-2.5 rounded-xl bg-elevated border border-border hover:border-cerulean hover:bg-cerulean/10 transition-all text-left flex flex-col"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-bold text-white group-hover/btn:text-cerulean-light transition-colors">
                          {formatTime(show.startTime)}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-muted border border-white/5">
                          {show.format}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted mt-0.5">
                        From ₹{minPrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowtimeSelector;
