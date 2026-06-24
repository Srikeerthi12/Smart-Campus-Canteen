import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    // Persist token and user info
    localStorage.setItem('canteen_token', token);
    localStorage.setItem('canteen_user', JSON.stringify(user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('canteen_token');
    localStorage.removeItem('canteen_user');
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('canteen_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('canteen_token'),
};
