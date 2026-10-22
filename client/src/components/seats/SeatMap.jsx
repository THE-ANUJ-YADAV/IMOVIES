import React from 'react';
import { Armchair, Lock, CheckCircle2 } from 'lucide-react';

export const SeatMap = ({
  seats = [],
  selectedSeats = [],
  onSeatToggle,
  pricing = [],
  isLoading = false
}) => {
  // Group seats by category and row
  const categoryOrder = ['Recliner', 'Premium', 'Standard'];

  const seatsByCategory = categoryOrder.map((category) => {
    const categorySeats = seats.filter((s) => s.category === category);
    const priceObj = pricing.find((p) => p.category === category);
    const price = priceObj ? priceObj.price : categorySeats[0]?.price || 250;

    // Group rows within this category
    const rowsMap = categorySeats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    // Sort seats in each row by column number
    Object.keys(rowsMap).forEach((row) => {
      rowsMap[row].sort((a, b) => a.col - b.col);
    });

    return {
      category,
      price,
      rows: rowsMap,
      hasSeats: Object.keys(rowsMap).length > 0
    };
  });

  const isSeatSelected = (seatNum) => {
    return selectedSeats.some((s) => s.seatNumber === seatNum);
  };

  const getSeatStyle = (seat) => {
    if (seat.state === 'BLOCKED') {
      return 'invisible pointer-events-none';
    }

    if (seat.state === 'BOOKED') {
      return 'bg-[#222222] border-[#333333] text-[#555555] cursor-not-allowed opacity-60';
    }

    if (seat.state === 'HELD') {
      return 'bg-warning/20 border-warning/50 text-warning cursor-not-allowed';
    }

    if (isSeatSelected(seat.seatNumber)) {
      return 'bg-cerulean border-cerulean text-white shadow-cerulean scale-105 font-bold';
    }

    // Available seat styles by category
    if (seat.category === 'Recliner') {
      return 'bg-card border-rose-neon/40 text-white hover:border-rose-neon hover:bg-rose-neon/10 hover:scale-105 cursor-pointer';
    }
    if (seat.category === 'Premium') {
      return 'bg-card border-border text-white hover:border-cerulean hover:bg-cerulean/10 hover:scale-105 cursor-pointer';
    }

    return 'bg-card border-border text-white hover:border-cerulean/80 hover:bg-cerulean/10 hover:scale-105 cursor-pointer';
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cerulean border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted">Loading live cinema layout & availability...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Curved Screen Perspective */}
      <div className="w-full flex flex-col items-center cinema-screen pt-4 pb-8">
        <div className="w-3/4 max-w-xl h-3 rounded-t-full bg-gradient-to-b from-cerulean via-cerulean/70 to-transparent cinema-screen-curve" />
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted mt-4">
          All eyes this way — Cinema Screen
        </span>
      </div>

      {/* Seating Layout Grid */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[650px] max-w-3xl mx-auto space-y-8">
          {seatsByCategory.map(({ category, price, rows, hasSeats }) => {
            if (!hasSeats) return null;

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-border pb-1 px-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center">
                    {category === 'Recliner' && (
                      <span className="w-2 h-2 rounded-full bg-rose-neon mr-2"></span>
                    )}
                    {category} Seats
                  </span>
                  <span className="text-xs font-extrabold text-cerulean">₹{price}</span>
                </div>

                {/* Rows in Category */}
                <div className="space-y-2.5">
                  {Object.entries(rows).map(([rowLetter, rowSeats]) => (
                    <div key={rowLetter} className="flex items-center justify-center space-x-3">
                      {/* Row Label Left */}
                      <span className="w-6 text-xs font-bold text-muted text-center">
                        {rowLetter}
                      </span>

                      {/* Seats in Row */}
                      <div className="flex items-center space-x-2">
                        {rowSeats.map((seat) => {
                          const selected = isSeatSelected(seat.seatNumber);
                          const isBooked = seat.state === 'BOOKED';
                          const isHeld = seat.state === 'HELD';
                          const isBlocked = seat.state === 'BLOCKED';

                          return (
                            <React.Fragment key={seat.seatNumber}>
                              {/* Aisle space separator */}
                              {seat.isAisle && <div className="w-4 sm:w-6" />}

                              <button
                                type="button"
                                disabled={isBooked || isHeld || isBlocked}
                                onClick={() => onSeatToggle(seat)}
                                title={`${seat.seatNumber} (${seat.category}) - ₹${seat.price}`}
                                className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-all ${getSeatStyle(
                                  seat
                                )}`}
                              >
                                {isBooked ? (
                                  <Lock className="w-3 h-3 text-[#555555]" />
                                ) : isHeld ? (
                                  <Lock className="w-3 h-3 text-warning" />
                                ) : (
                                  seat.col
                                )}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Row Label Right */}
                      <span className="w-6 text-xs font-bold text-muted text-center">
                        {rowLetter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat State Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border text-xs text-muted">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-card border border-border"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-cerulean border border-cerulean shadow-cerulean"></div>
          <span className="text-white font-medium">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-warning/20 border border-warning/50 flex items-center justify-center">
            <Lock className="w-3 h-3 text-warning" />
          </div>
          <span>Held by other</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center">
            <Lock className="w-3 h-3 text-[#555555]" />
          </div>
          <span>Sold Out</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-card border border-rose-neon/60"></div>
          <span>Recliner (Luxury)</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
