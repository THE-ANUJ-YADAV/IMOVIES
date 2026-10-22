import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';

export const BookingFailedPage = () => {
  const location = useLocation();
  const errorMessage =
    location.state?.message || 'The payment could not be processed or was cancelled by the user.';
  const bookingId = location.state?.bookingId;

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="inline-flex p-4 rounded-full bg-error/15 border border-error/30 text-error shadow-md">
        <XCircle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Payment Unsuccessful</h1>
        <p className="text-sm text-muted max-w-md mx-auto">{errorMessage}</p>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border text-xs text-muted max-w-md mx-auto">
        No money was charged to your account. If amount was deducted, it will be automatically reversed by your bank within 3-5 business days.
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {bookingId && (
          <Link
            to={`/checkout/${bookingId}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-cerulean"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Payment Again</span>
          </Link>
        )}

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

export default BookingFailedPage;
