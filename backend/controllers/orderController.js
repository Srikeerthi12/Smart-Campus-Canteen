const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');


// Create order
const createOrder = async (req, res) => {
  try {
    const { items, quantities, total, canteenId } = req.body;
    const userId = req.user.userId; // From JWT token

    if (!items || !quantities || items.length !== quantities.length || !canteenId) {
      return res.status(400).json({ message: 'Items, quantities, and canteenId are required' });
    }

    if (total <= 0) {
      return res.status(400).json({ message: 'Total must be greater than 0' });
    }

    const order = new Order({
      user: userId,
      items,
      quantities,
      total,
      canteenId
    });

    await order.save();
    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('user')
      .populate('items');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Get all orders of a user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    const orders = await Order.find({ user: userId })
      .populate('items')
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all orders (admin/owner only)
const getAllOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'canteenOwner') {
        query.canteenId = req.user.canteenId;
    }

    const orders = await Order.find(query)
      .populate('user')
      .populate('items')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const orderToUpdate = await Order.findById(id);
    if (!orderToUpdate) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== orderToUpdate.canteenId.toString()) {
        return res.status(403).json({ message: 'You can only update orders for your own canteen' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: 'Order status updated successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order' });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancelling if not already delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};