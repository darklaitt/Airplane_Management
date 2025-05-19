import api from './apiService';

const planeService = {
  getAll: async () => {
    const response = await api.get('/planes');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/planes/${id}`);
    return response.data;
  },

  create: async (planeData) => {
    const response = await api.post('/planes', planeData);
    return response.data;
  },

  update: async (id, planeData) => {
    const response = await api.put(`/planes/${id}`, planeData);
    return response.data;
  },

  delete: async (id) => {
    return await api.delete(`/planes/${id}`);
  },
};

export default planeService;