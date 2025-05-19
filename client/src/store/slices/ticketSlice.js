import { createSlice } from '@reduxjs/toolkit';

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    currentTicket: null,
    salesStatistics: null,
    loading: false,
    error: null,
    filters: {
      flightNumber: '',
      counterNumber: '',
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: ''
    },
    sorting: {
      field: 'sale_time',
      direction: 'desc'
    },
    pagination: {
      page: 1,
      limit: 20,
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

    // Tickets operations
    setTicketsSuccess: (state, action) => {
      state.tickets = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTicketSuccess: (state, action) => {
      state.tickets.unshift(action.payload); // Add to beginning for recent tickets
      state.loading = false;
      state.error = null;
    },
    deleteTicketSuccess: (state, action) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
      state.loading = false;
      state.error = null;
    },

    // Current ticket
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },

    // Sales statistics
    setSalesStatistics: (state, action) => {
      state.salesStatistics = action.payload;
    },
    clearSalesStatistics: (state) => {
      state.salesStatistics = null;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        flightNumber: '',
        counterNumber: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: ''
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

    // Bulk operations
    setTicketsByFlight: (state, action) => {
      const { flightNumber, tickets } = action.payload;
      state.tickets = tickets;
      state.loading = false;
      state.error = null;
    },

    // Statistics calculations
    calculateStatistics: (state) => {
      if (state.tickets.length === 0) {
        state.salesStatistics = {
          totalTickets: 0,
          totalRevenue: 0,
          averagePrice: 0,
          topCounters: [],
          topFlights: []
        };
        return;
      }

      const totalTickets = state.tickets.length;
      const totalRevenue = state.tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
      const averagePrice = totalRevenue / totalTickets;

      // Group by counter
      const counterSales = state.tickets.reduce((acc, ticket) => {
        const counter = ticket.counter_number;
        if (!acc[counter]) {
          acc[counter] = { count: 0, revenue: 0 };
        }
        acc[counter].count++;
        acc[counter].revenue += ticket.price || 0;
        return acc;
      }, {});

      const topCounters = Object.entries(counterSales)
        .map(([counter, data]) => ({
          counter: parseInt(counter),
          tickets: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Group by flight
      const flightSales = state.tickets.reduce((acc, ticket) => {
        const flight = ticket.flight_number;
        if (!acc[flight]) {
          acc[flight] = { count: 0, revenue: 0 };
        }
        acc[flight].count++;
        acc[flight].revenue += ticket.price || 0;
        return acc;
      }, {});

      const topFlights = Object.entries(flightSales)
        .map(([flight, data]) => ({
          flight,
          tickets: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      state.salesStatistics = {
        totalTickets,
        totalRevenue,
        averagePrice,
        topCounters,
        topFlights
      };
    },

    // Reset state
    resetTicketsState: (state) => {
      state.tickets = [];
      state.currentTicket = null;
      state.salesStatistics = null;
      state.loading = false;
      state.error = null;
      state.filters = {
        flightNumber: '',
        counterNumber: '',
        dateFrom: '',
        dateTo: '',
        minPrice: '',
        maxPrice: ''
      };
      state.sorting = {
        field: 'sale_time',
        direction: 'desc'
      };
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0
      };
    }
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setTicketsSuccess,
  addTicketSuccess,
  deleteTicketSuccess,
  setCurrentTicket,
  clearCurrentTicket,
  setSalesStatistics,
  clearSalesStatistics,
  setFilters,
  clearFilters,
  setSorting,
  setPagination,
  setTicketsByFlight,
  calculateStatistics,
  resetTicketsState,
} = ticketSlice.actions;

export default ticketSlice.reducer;