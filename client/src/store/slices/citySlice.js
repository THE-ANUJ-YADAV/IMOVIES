import { createSlice } from '@reduxjs/toolkit';

const savedCity = localStorage.getItem('imovies_city') || 'Mumbai';

const initialState = {
  selectedCity: savedCity,
  availableCities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad']
};

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    setCity: (state, action) => {
      state.selectedCity = action.payload;
      localStorage.setItem('imovies_city', action.payload);
    }
  }
});

export const { setCity } = citySlice.actions;
export default citySlice.reducer;
