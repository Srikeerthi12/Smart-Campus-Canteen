import api from './api';

export const adminService = {
  // Create a new canteen owner account and assign to a canteen
  createOwner: async (data) => {
    const response = await api.post('/admin/owners', data);
    return response.data;
  },

  // Get all canteen owners
  getOwners: async () => {
    const response = await api.get('/admin/owners');
    return response.data.owners || [];
  },
};
