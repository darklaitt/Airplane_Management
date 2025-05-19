import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import planeReducer from './slices/planeSlice';
import flightReducer from './slices/flightSlice';
import ticketReducer from './slices/ticketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    planes: planeReducer,
    flights: flightReducer,
    tickets: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});