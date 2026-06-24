import api from './api';

export const menuService = {
  getAll: async () => {
    const response = await api.get('/menu');
    return response.data.menuItems || [];
  },

  getByCanteen: async (canteenId) => {
    try {
      const response = await api.get(`/menu/canteen/${canteenId}`);
      return response.data.menuItems || [];
    } catch (err) {
      // Backend returns 404 when canteen has no items — treat as empty list
      if (err.response?.status === 404) return [];
      throw err;
    }
  },

  getById: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data.menuItem;
  },

  create: async (data) => {
    const response = await api.post('/menu', data);
    return response.data.menuItem;
  },

  update: async (id, data) => {
    const response = await api.put(`/menu/${id}`, data);
    return response.data.menuItem;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  toggleAvailability: async (id, isAvailable) => {
    const response = await api.put(`/menu/${id}`, { isAvailable });
    return response.data.menuItem;
  },
};
