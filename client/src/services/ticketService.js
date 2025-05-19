import api from './apiService';

const ticketService = {
  getAll: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  delete: async (id) => {
    return await api.delete(`/tickets/${id}`);
  },

  getByFlight: async (flightNumber) => {
    const response = await api.get(`/tickets/flight/${flightNumber}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/tickets/search/by-date', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getSalesByCounter: async (startDate, endDate) => {
    const response = await api.get('/tickets/reports/sales-by-counter', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export default ticketService;