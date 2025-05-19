import api from './apiService';

const flightService = {
  getAll: async () => {
    const response = await api.get('/flights');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/flights/${id}`);
    return response.data;
  },

  create: async (flightData) => {
    const response = await api.post('/flights', flightData);
    return response.data;
  },

  update: async (id, flightData) => {
    const response = await api.put(`/flights/${id}`, flightData);
    return response.data;
  },

  delete: async (id) => {
    return await api.delete(`/flights/${id}`);
  },

  // Special queries
  findNearestFlight: async (destination) => {
    const response = await api.get('/flights/search/nearest', {
      params: { destination }
    });
    return response.data;
  },

  getFlightsWithoutStops: async () => {
    const response = await api.get('/flights/search/non-stop');
    return response.data;
  },

  getFlightsByPlane: async (planeId) => {
    const response = await api.get(`/flights/plane/${planeId}`);
    return response.data;
  },

  getFlightLoad: async (flightNumber, startDate, endDate) => {
    const response = await api.get(`/flights/load/${flightNumber}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getMostExpensiveFlight: async () => {
    const response = await api.get('/flights/search/most-expensive');
    return response.data;
  },

  getFlightsForReplacement: async (minFreeSeatsPercentage = 50) => {
    const response = await api.get('/flights/search/replacement-candidates', {
      params: { minFreeSeatsPercentage }
    });
    return response.data;
  },

  checkFreeSeats: async (flightNumber) => {
    const response = await api.get(`/flights/check-seats/${flightNumber}`);
    return response.data;
  },
};

export default flightService;