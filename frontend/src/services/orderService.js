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

  getAllOrders: async () => {
    const response = await api.get('/orders');
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
