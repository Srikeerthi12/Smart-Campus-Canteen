import api from './api';

export const canteenService = {
  getAll: async () => {
    const response = await api.get('/canteens');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/canteens/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/canteens', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/canteens/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/canteens/${id}`);
    return response.data;
  },
};
