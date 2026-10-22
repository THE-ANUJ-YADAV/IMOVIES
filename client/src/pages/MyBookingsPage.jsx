import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  X
} from 'lucide-react';
import api from '../services/api';
import DigitalTicket from '../components/booking/DigitalTicket';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bookings/my?status=${activeTab}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;

    try {
      setIsCancelling(true);
      setStatusMessage({ text: '', type: '' });

      const res = await api.post(`/bookings/${cancelModalBooking._id}/cancel`, {
        reason: cancelReason || 'Customer requested'
      });

      setStatusMessage({
        text: 'Booking successfully cancelled. Refund has been initiated.',
        type: 'success'
      });
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      setStatusMessage({
        text: err.message || 'Failed to cancel booking. Check 2-hour policy.',
        type: 'error'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const isEligibleForCancellation = (showTime) => {
    const now = new Date();
    const show = new Date(showTime);
    const diffHours = (show - now) / (1000 * 60 * 60);
    return diffHours >= 2;
  };

  const formatShowDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShowTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
          <p className="text-sm text-muted mt-1">
            Access your active cinema tickets, QR entry passes, and booking history
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-2 bg-card p-1 rounded-2xl border border-border">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cerulean text-white shadow-cerulean'
                  : 'text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-success/15 border border-success/30 text-success'
              : 'bg-error/15 border border-error/30 text-error'
          }`}
        >
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-card rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-card border border-border space-y-4">
          <Ticket className="w-12 h-12 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No {activeTab} bookings found</h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Ready for your next movie experience? Discover movies and reserve your seats now.
          </p>
          <Link
            to="/movies"
            className="inline-block px-6 py-3 rounded-xl bg-cerulean text-white text-xs font-bold hover:bg-cerulean-hover shadow-cerulean transition-all"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canCancel =
              booking.bookingStatus === 'CONFIRMED' &&
              isEligibleForCancellation(booking.showTime);

            return (
              <div
                key={booking._id}
                className="p-6 rounded-3xl bg-card border border-border hover:border-cerulean/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Poster & Details */}
                <div className="flex items-start space-x-5">
                  <img
                    src={booking.movieSnapshot?.posterUrl}
                    alt={booking.movieSnapshot?.title}
                    className="w-20 sm:w-24 rounded-xl aspect-[2/3] object-cover shadow-md"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-extrabold text-white">
                        {booking.movieSnapshot?.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cerulean/20 text-cerulean border border-cerulean/30 uppercase">
                        {booking.movieSnapshot?.format}
                      </span>
                    </div>

                    <div className="text-xs text-muted space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-neon" />
                        <span className="text-white font-medium">
                          {booking.theatreSnapshot?.name}
                        </span>
                        <span>•</span>
                        <span>{booking.theatreSnapshot?.screenName}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-muted">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-cerulean" />
                          {formatShowDate(booking.showTime)}
                        </span>
                        <span className="flex items-center text-white font-semibold">
                          <Clock className="w-3.5 h-3.5 mr-1 text-cerulean" />
                          {formatShowTime(booking.showTime)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center space-x-2 text-xs">
                      <span className="text-muted">Seats:</span>
                      <span className="font-extrabold text-rose-neon">
                        {booking.seats?.map((s) => s.seatNumber).join(', ')}
                      </span>
                      <span className="text-muted">•</span>
                      <span className="text-muted">Ref:</span>
                      <span className="font-mono text-white font-bold">{booking.bookingReference}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 w-full md:w-auto border-t md:border-t-0 border-border pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted">Amount Paid</span>
                    <p className="text-xl font-extrabold text-white">
                      ₹{booking.priceBreakdown?.total}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-success/15 text-success border border-success/30'
                          : booking.bookingStatus === 'CANCELLED'
                          ? 'bg-error/15 text-error border border-error/30'
                          : 'bg-warning/15 text-warning border border-warning/30'
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    {booking.bookingStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="px-4 py-2 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-cerulean transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Ticket</span>
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => setCancelModalBooking(booking)}
                        className="px-3 py-2 rounded-xl bg-elevated hover:bg-card border border-border hover:border-error text-muted hover:text-error text-xs font-semibold transition-all"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-card border border-border text-white hover:text-rose-neon transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <DigitalTicket booking={selectedTicket} />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-warning">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Cancellation</h3>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to cancel your booking for{' '}
              <strong className="text-white">
                {cancelModalBooking.movieSnapshot?.title}
              </strong>{' '}
              (Seats: {cancelModalBooking.seats?.map((s) => s.seatNumber).join(', ')})?
            </p>

            <div className="p-3 rounded-xl bg-elevated text-xs text-muted border border-border space-y-1">
              <div className="flex justify-between">
                <span>Refundable Ticket Amount:</span>
                <span className="font-bold text-white">
                  ₹{cancelModalBooking.priceBreakdown?.subtotal}
                </span>
              </div>
              <p className="text-[10px] text-muted pt-1">
                Note: Non-refundable convenience fee applies per policy. Seats will be immediately released.
              </p>
            </div>

            <textarea
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-elevated border border-border text-xs text-white placeholder-muted focus:outline-none focus:border-cerulean resize-none h-20"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-3 rounded-xl bg-elevated hover:bg-card border border-border text-white text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-error hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
