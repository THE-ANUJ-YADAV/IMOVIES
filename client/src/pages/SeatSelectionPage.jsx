import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Clock,
  Ticket,
  AlertCircle,
  Film,
  MapPin,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../services/api';
import { getSocket, joinShowRoom, leaveShowRoom } from '../services/socket';
import { setHoldInfo, setBookingDetails } from '../store/slices/bookingSlice';
import SeatMap from '../components/seats/SeatMap';

export const SeatSelectionPage = () => {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { sessionToken } = useSelector((state) => state.booking);

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch seat map
  const fetchSeats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/shows/${showId}/seats?sessionToken=${sessionToken}`);
      setShow(res.data.show);
      setSeats(res.data.seats || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load cinema layout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    // Setup Socket.IO real-time connection
    const socket = getSocket();
    joinShowRoom(showId);

    // Real-time listener for seats held by others
    socket.on('seat-held', (payload) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (payload.seats.includes(seat.seatNumber)) {
            const isMine = payload.sessionToken === sessionToken;
            return {
              ...seat,
              state: isMine ? 'HELD_BY_ME' : 'HELD'
            };
          }
          return seat;
        })
      );
    });

    // Real-time listener for seats released or expired
    socket.on('seat-released', (payload) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (payload.seats.includes(seat.seatNumber)) {
            return {
              ...seat,
              state: 'AVAILABLE'
            };
          }
          return seat;
        })
      );
    });

    // Real-time listener for confirmed bookings
    socket.on('seats-booked', (payload) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          if (payload.seats.includes(seat.seatNumber)) {
            return {
              ...seat,
              state: 'BOOKED'
            };
          }
          return seat;
        })
      );
    });

    return () => {
      leaveShowRoom(showId);
      socket.off('seat-held');
      socket.off('seat-released');
      socket.off('seats-booked');
    };
  }, [showId, sessionToken]);

  const handleSeatToggle = (seat) => {
    setErrorMessage('');
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        setErrorMessage('Maximum 10 seats allowed per booking transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shows/${showId}/seats` } });
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // 1. Create server-enforced seat hold
      const seatNums = selectedSeats.map((s) => s.seatNumber);
      const holdRes = await api.post(`/shows/${showId}/holds`, {
        seats: seatNums,
        sessionToken
      });

      dispatch(
        setHoldInfo({
          expiresAt: holdRes.data.expiresAt,
          sessionToken: holdRes.data.sessionToken
        })
      );

      // 2. Initialize booking record
      const bookingRes = await api.post('/bookings', {
        showId,
        seats: seatNums,
        sessionToken: holdRes.data.sessionToken
      });

      dispatch(setBookingDetails(bookingRes.data.booking));
      navigate(`/checkout/${bookingRes.data.booking.id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Seat reservation failed. Some seats may have just been taken.');
      fetchSeats(); // Refresh seats to reflect current state
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatShowTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Show & Movie Summary Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <Link
            to={show?.movie?._id ? `/movies/${show.movie._id}` : '/movies'}
            className="p-2.5 rounded-xl bg-elevated hover:bg-card border border-border text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {show?.movie?.title || 'Cinema Show'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cerulean/20 text-cerulean border border-cerulean/30">
                {show?.format}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted mt-1">
              <span className="font-semibold text-white">{show?.theatre?.name}</span>
              <span>•</span>
              <span>{show?.screen?.name}</span>
              <span>•</span>
              <span className="text-cerulean font-bold">{formatShowTime(show?.startTime)}</span>
            </div>
          </div>
        </div>

        {/* Realtime Live Pulse Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-elevated border border-border text-xs text-muted self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          <span>Live Synchronized Seating</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-error/15 border border-error/30 text-error text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Seat Map */}
      <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-2xl">
        <SeatMap
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatToggle={handleSeatToggle}
          pricing={show?.pricing || []}
          isLoading={isLoading}
        />
      </div>

      {/* Floating Checkout Bottom Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-jet/95 backdrop-blur-lg border-t border-border shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-cerulean/20 border border-cerulean/40 flex items-center justify-center text-cerulean">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted">
                  Selected Seats ({selectedSeats.length}):{' '}
                  <span className="text-white font-bold">
                    {selectedSeats.map((s) => s.seatNumber).join(', ')}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  Subtotal: <span className="text-cerulean">₹{calculateSubtotal()}</span>
                  <span className="text-xs text-muted font-normal ml-2">
                    (+ taxes & convenience fee at checkout)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cerulean hover:bg-cerulean-hover text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-cerulean transition-all hover:scale-105 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Reserving Seats...' : 'Proceed to Checkout'}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelectionPage;
