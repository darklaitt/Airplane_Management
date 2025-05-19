import { createSlice } from '@reduxjs/toolkit';

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: [],
    currentFlight: null,
    searchResults: null,
    loading: false,
    error: null,
    filters: {
      destination: '',
      departure: '',
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: '',
      hasSeats: false
    },
    sorting: {
      field: 'departure_time',
      direction: 'asc'
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },
  reducers: {
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Flights operations
    setFlightsSuccess: (state, action) => {
      state.flights = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFlightSuccess: (state, action) => {
      state.flights.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateFlightSuccess: (state, action) => {
      const index = state.flights.findIndex(flight => flight.id === action.payload.id);
      if (index !== -1) {
        state.flights[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteFlightSuccess: (state, action) => {
      state.flights = state.flights.filter(flight => flight.id !== action.payload);
      state.loading = false;
      state.error = null;
    },

    // Current flight
    setCurrentFlight: (state, action) => {
      state.currentFlight = action.payload;
    },
    clearCurrentFlight: (state) => {
      state.currentFlight = null;
    },

    // Search results
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        destination: '',
        departure: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: '',
        hasSeats: false
      };
    },

    // Sorting
    setSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Update free seats (for real-time updates)
    updateFlightSeats: (state, action) => {
      const { flightNumber, seatChange } = action.payload;
      const flight = state.flights.find(f => f.flight_number === flightNumber);
      if (flight) {
        flight.free_seats = Math.max(0, flight.free_seats + seatChange);
      }
    },

    // Reset state
    resetFlightsState: (state) => {
      state.flights = [];
      state.currentFlight = null;
      state.searchResults = null;
      state.loading = false;
      state.error = null;
      state.filters = {
        destination: '',
        departure: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: '',
        hasSeats: false
      };
      state.sorting = {
        field: 'departure_time',
        direction: 'asc'
      };
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0
      };
    }
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setFlightsSuccess,
  addFlightSuccess,
  updateFlightSuccess,
  deleteFlightSuccess,
  setCurrentFlight,
  clearCurrentFlight,
  setSearchResults,
  clearSearchResults,
  setFilters,
  clearFilters,
  setSorting,
  setPagination,
  updateFlightSeats,
  resetFlightsState,
} = flightSlice.actions;

export default flightSlice.reducer;