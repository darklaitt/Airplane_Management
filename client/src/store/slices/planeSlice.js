import { createSlice } from '@reduxjs/toolkit';

const planeSlice = createSlice({
  name: 'planes',
  initialState: {
    planes: [],
    currentPlane: null,
    loading: false,
    error: null,
    filters: {
      category: '',
      searchTerm: ''
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

    // Planes operations
    setPlanesSuccess: (state, action) => {
      state.planes = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPlaneSuccess: (state, action) => {
      state.planes.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    updatePlaneSuccess: (state, action) => {
      const index = state.planes.findIndex(plane => plane.id === action.payload.id);
      if (index !== -1) {
        state.planes[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deletePlaneSuccess: (state, action) => {
      state.planes = state.planes.filter(plane => plane.id !== action.payload);
      state.loading = false;
      state.error = null;
    },

    // Current plane
    setCurrentPlane: (state, action) => {
      state.currentPlane = action.payload;
    },
    clearCurrentPlane: (state) => {
      state.currentPlane = null;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        searchTerm: ''
      };
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Reset state
    resetPlanesState: (state) => {
      state.planes = [];
      state.currentPlane = null;
      state.loading = false;
      state.error = null;
      state.filters = {
        category: '',
        searchTerm: ''
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
  setPlanesSuccess,
  addPlaneSuccess,
  updatePlaneSuccess,
  deletePlaneSuccess,
  setCurrentPlane,
  clearCurrentPlane,
  setFilters,
  clearFilters,
  setPagination,
  resetPlanesState,
} = planeSlice.actions;

export default planeSlice.reducer;