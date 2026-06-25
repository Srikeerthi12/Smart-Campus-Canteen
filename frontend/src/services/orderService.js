import api from './api';

export const orderService = {
  create: async (data) => {
    const response = await api.post('/orders', data);
    return response.data.order;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/user/my-orders');
    return response.data.orders || [];
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  },

  /**
   * Get all orders (admin / owner).
   * Admins can optionally pass filters: { canteenId, studentId, dateFrom, dateTo }
   */
  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.canteenId) params.append('canteenId', filters.canteenId);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/orders${query}`);
    return response.data.orders || [];
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.order;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data.order;
  },
};
