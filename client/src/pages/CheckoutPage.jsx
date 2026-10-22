import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle,
  Film,
  MapPin,
  Calendar,
  Ticket,
  Lock,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';

export const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { holdExpiresAt } = useSelector((state) => state.booking);

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins default

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);

        if (res.data.booking.bookingStatus === 'CONFIRMED') {
          navigate('/booking/success', { state: { booking: res.data.booking } });
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Expiration countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('Your seat hold has expired. Please reselect your seats.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');

      // 1. Create payment order on backend
      const orderRes = await api.post('/payments/create-order', { bookingId });
      const { orderId, amountInPaise, keyId, movieTitle, bookingReference } = orderRes.data;

      // 2. Razorpay checkout
      if (window.Razorpay && !keyId.includes('imoviesDemoKey')) {
        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: 'INR',
          name: 'IMovies Cinemas',
          description: `Tickets for ${movieTitle}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              // 3. Verify signature on backend
              const verifyRes = await api.post('/payments/verify', {
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              navigate('/booking/success', {
                state: { booking: verifyRes.data.booking }
              });
            } catch (verErr) {
              navigate('/booking/failed', {
                state: { message: verErr.message, bookingId }
              });
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '9999999999'
          },
          theme: {
            color: '#007BA7'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          navigate('/booking/failed', {
            state: { message: response.error.description, bookingId }
          });
        });
        rzp.open();
      } else {
        // Test mode / Sandbox simulator
        const verifyRes = await api.post('/payments/verify', {
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_simulated_${Date.now()}`,
          razorpay_signature: 'mock_simulated_signature'
        });

        navigate('/booking/success', {
          state: { booking: verifyRes.data.booking }
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-jet flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cerulean border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <Link to="/" className="text-cerulean text-sm font-semibold hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white">Checkout & Payment</h1>
          <p className="text-xs text-muted">Complete payment to finalize your seat reservation</p>
        </div>

        {/* Expiration Timer Card */}
        <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-card border border-rose-neon/40 shadow-rose">
          <Clock className="w-4 h-4 text-rose-neon animate-pulse" />
          <span className="text-xs font-bold text-muted">Hold Time:</span>
          <span className="text-sm font-mono font-extrabold text-rose-neon">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-error/15 border border-error/30 text-error text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Checkout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Booking Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-border pb-3">
              Booking Summary
            </h3>

            {/* Movie Info */}
            <div className="flex space-x-4">
              <img
                src={booking.movieSnapshot?.posterUrl}
                alt={booking.movieSnapshot?.title}
                className="w-20 sm:w-24 rounded-xl aspect-[2/3] object-cover shadow-md"
              />
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-white">
                  {booking.movieSnapshot?.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cerulean/20 text-cerulean border border-cerulean/30">
                    {booking.movieSnapshot?.format}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-elevated border border-border text-muted">
                    {booking.movieSnapshot?.language}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  <span className="font-semibold text-white">{booking.theatreSnapshot?.name}</span>{' '}
                  ({booking.theatreSnapshot?.screenName})
                </div>
              </div>
            </div>

            {/* Selected Seats List */}
            <div className="bg-elevated p-4 rounded-2xl border border-border space-y-2">
              <div className="flex justify-between text-xs text-muted font-bold uppercase tracking-wider">
                <span>Seat Details</span>
                <span>Category</span>
                <span>Price</span>
              </div>
              {booking.seats?.map((seat) => (
                <div
                  key={seat.seatNumber}
                  className="flex justify-between items-center text-sm border-t border-border/50 pt-2"
                >
                  <span className="font-bold text-white flex items-center">
                    <Ticket className="w-3.5 h-3.5 mr-1.5 text-cerulean" />
                    Seat {seat.seatNumber}
                  </span>
                  <span className="text-xs text-muted">{seat.category}</span>
                  <span className="font-extrabold text-white">₹{seat.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Payment Assurance */}
          <div className="p-5 rounded-2xl bg-card border border-border flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center text-success flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs text-muted space-y-1">
              <h5 className="font-bold text-white text-sm">Protected by Razorpay Test Sandbox</h5>
              <p>
                Server-side HMAC-SHA256 signature verification guarantees atomic and tamper-proof ticket allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Price Breakdown & CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-border pb-3">
              Payment Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Ticket Subtotal</span>
                <span className="text-white font-semibold">
                  ₹{booking.priceBreakdown?.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Convenience Fee</span>
                <span className="text-white font-semibold">
                  ₹{booking.priceBreakdown?.convenienceFee}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Integrated GST (18%)</span>
                <span className="text-white font-semibold">₹{booking.priceBreakdown?.tax}</span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-white">Grand Total</span>
                <span className="text-2xl font-extrabold text-cerulean">
                  ₹{booking.priceBreakdown?.total}
                </span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isProcessing || timeLeft <= 0}
              className="w-full py-4 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-base font-extrabold flex items-center justify-center space-x-2 shadow-cerulean transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>{isProcessing ? 'Processing Securely...' : `Pay ₹${booking.priceBreakdown?.total}`}</span>
            </button>

            <p className="text-[11px] text-center text-muted">
              By proceeding, you agree to IMovies cancellation and seating policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
