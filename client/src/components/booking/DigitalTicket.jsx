import React, { useRef } from 'react';
import { Film, Printer, Download, MapPin, Calendar, Clock, CheckCircle2, Ticket } from 'lucide-react';

export const DigitalTicket = ({ booking }) => {
  const ticketRef = useRef();

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatShowDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatShowTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Digital Ticket Card */}
      <div
        ref={ticketRef}
        className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-2xl print:border-black print:text-black print:bg-white"
      >
        {/* Ticket Header Banner */}
        <div className="p-6 bg-gradient-to-r from-jet via-elevated to-jet border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cerulean flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              <span className="text-cerulean">I</span>MOVIES CINEMAS
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRMED</span>
          </div>
        </div>

        {/* Ticket Main Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Movie Details */}
          <div className="flex space-x-5">
            <img
              src={booking.movieSnapshot?.posterUrl}
              alt={booking.movieSnapshot?.title}
              className="w-24 sm:w-28 rounded-xl aspect-[2/3] object-cover shadow-md"
            />
            <div className="flex-1 space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {booking.movieSnapshot?.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-elevated border border-border text-muted">
                  {booking.movieSnapshot?.language || 'English'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cerulean/20 text-cerulean border border-cerulean/30">
                  {booking.movieSnapshot?.format || '2D'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-elevated border border-border text-muted">
                  {booking.movieSnapshot?.certification || 'UA'}
                </span>
              </div>

              <div className="text-xs text-muted pt-1 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-neon" />
                  <span className="font-semibold text-white">
                    {booking.theatreSnapshot?.name}
                  </span>
                </div>
                <p className="pl-5 text-muted truncate">{booking.theatreSnapshot?.address}</p>
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative flex items-center justify-between py-2">
            <div className="absolute -left-10 w-8 h-8 rounded-full bg-jet border border-border" />
            <div className="w-full border-t border-dashed border-border" />
            <div className="absolute -right-10 w-8 h-8 rounded-full bg-jet border border-border" />
          </div>

          {/* Show & Seat Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-elevated p-4 rounded-2xl border border-border text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Date</span>
              <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                {formatShowDate(booking.showTime)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Time</span>
              <p className="text-xs sm:text-sm font-extrabold text-cerulean mt-0.5">
                {formatShowTime(booking.showTime)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Screen</span>
              <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                {booking.theatreSnapshot?.screenName || 'Screen 1'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted tracking-wider">Seats</span>
              <p className="text-xs sm:text-sm font-extrabold text-rose-neon mt-0.5">
                {booking.seats?.map((s) => s.seatNumber).join(', ')}
              </p>
            </div>
          </div>

          {/* QR Code and Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Booking Reference
              </span>
              <p className="text-lg font-mono font-bold tracking-wider text-white">
                {booking.bookingReference}
              </p>
              <p className="text-[11px] text-muted">
                Total Paid: <span className="font-bold text-white">₹{booking.priceBreakdown?.total}</span>
              </p>
              <span className="inline-block mt-2 text-[10px] text-muted bg-card px-2 py-1 rounded border border-border">
                Present this QR at admission gate
              </span>
            </div>

            {/* QR Code */}
            {booking.qrCode && (
              <div className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-cerulean/40 shadow-cerulean flex flex-col items-center">
                <img
                  src={booking.qrCode}
                  alt="Entry QR"
                  className="w-32 h-32 rounded-lg"
                />
                <span className="text-[9px] font-mono text-muted tracking-widest uppercase mt-1">
                  SECURE ADMISSION
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-card border border-border hover:border-cerulean text-white text-sm font-semibold transition-all shadow-md"
        >
          <Printer className="w-4 h-4 text-cerulean" />
          <span>Print Ticket</span>
        </button>
      </div>
    </div>
  );
};

export default DigitalTicket;
