import { configureStore } from '@reduxjs/toolkit';
import planeReducer from './slices/planeSlice';
import flightReducer from './slices/flightSlice';
import ticketReducer from './slices/ticketSlice';

export const store = configureStore({
  reducer: {
    planes: planeReducer,
    flights: flightReducer,
    tickets: ticketReducer,
  },
});