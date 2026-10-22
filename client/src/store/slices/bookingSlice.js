import { createSlice } from '@reduxjs/toolkit';

const getInitialSessionToken = () => {
  let token = sessionStorage.getItem('imovies_session_token');
  if (!token) {
    token = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    sessionStorage.setItem('imovies_session_token', token);
  }
  return token;
};

const initialState = {
  currentShow: null,
  selectedSeats: [],
  sessionToken: getInitialSessionToken(),
  holdExpiresAt: null,
  bookingDetails: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentShow: (state, action) => {
      state.currentShow = action.payload;
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    toggleSeat: (state, action) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex((s) => s.seatNumber === seat.seatNumber);
      if (index > -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        if (state.selectedSeats.length < 10) {
          state.selectedSeats.push(seat);
        }
      }
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
    setHoldInfo: (state, action) => {
      state.holdExpiresAt = action.payload.expiresAt;
      if (action.payload.sessionToken) {
        state.sessionToken = action.payload.sessionToken;
        sessionStorage.setItem('imovies_session_token', action.payload.sessionToken);
      }
    },
    setBookingDetails: (state, action) => {
      state.bookingDetails = action.payload;
    },
    resetBookingState: (state) => {
      state.selectedSeats = [];
      state.holdExpiresAt = null;
      state.bookingDetails = null;
    }
  }
});

export const {
  setCurrentShow,
  setSelectedSeats,
  toggleSeat,
  clearSelectedSeats,
  setHoldInfo,
  setBookingDetails,
  resetBookingState
} = bookingSlice.actions;

export default bookingSlice.reducer;
