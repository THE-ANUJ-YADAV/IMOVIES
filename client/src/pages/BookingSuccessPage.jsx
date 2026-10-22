import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, ArrowRight, Home } from 'lucide-react';
import DigitalTicket from '../components/booking/DigitalTicket';

export const BookingSuccessPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Ticket className="w-12 h-12 text-cerulean mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Booking Confirmation</h2>
        <Link to="/my-bookings" className="text-cerulean text-sm font-semibold hover:underline">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Success Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-success/15 border border-success/30 text-success shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Your payment was verified successfully. Your digital ticket and QR admission pass are ready below.
        </p>
      </div>

      {/* Digital Ticket */}
      <DigitalTicket booking={booking} />

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/my-bookings"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-cerulean"
        >
          <Ticket className="w-4 h-4" />
          <span>View in My Bookings</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card hover:bg-elevated border border-border text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
