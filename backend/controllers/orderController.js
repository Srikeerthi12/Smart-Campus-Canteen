const Order = require('../models/Order');
const Canteen = require('../models/Canteen');
const authMiddleware = require('../middleware/auth');

// ── Helper: build canteenSnapshot from a canteen document ──────────────────
const buildSnapshot = (canteen) => ({
  name:         canteen?.name         || '',
  location:     canteen?.location     || '',
  contactPhone: canteen?.contactPhone || '',
});

// ── Helper: build userSnapshot from a user document ────────────────────────
const buildUserSnapshot = (user) => ({
  name:  user?.name  || 'Student',
  email: user?.email || '',
});

// ── Helper: enrich order with snapshots if population fails ──────────────────
// If populate() returned a real object, use it; else fall back to snapshot.
const enrichOrder = (order) => {
  const o = order.toObject ? order.toObject() : { ...order };

  // 1. Canteen fallback
  if (!o.canteenId || typeof o.canteenId !== 'object') {
    if (o.canteenSnapshot && o.canteenSnapshot.name) {
      o.canteenId = {
        _id:          o.canteenId,
        name:         o.canteenSnapshot.name,
        location:     o.canteenSnapshot.location,
        contactPhone: o.canteenSnapshot.contactPhone,
      };
    }
  }

  // 2. User fallback
  if (!o.user || typeof o.user !== 'object') {
    if (o.userSnapshot && o.userSnapshot.name) {
      o.user = {
        _id:   o.user,
        name:  o.userSnapshot.name,
        email: o.userSnapshot.email,
      };
    }
  }

  return o;
};

// ── Create order ────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, quantities, total, canteenId, specialInstructions } = req.body;
    const userId = req.user.userId;

    if (!items || !quantities || items.length !== quantities.length || !canteenId) {
      return res.status(400).json({ message: 'Items, quantities, and canteenId are required' });
    }
    if (total <= 0) {
      return res.status(400).json({ message: 'Total must be greater than 0' });
    }

    // Look up canteen. If provided canteenId is stale, try deriving from the first menu item.
    let canteen = await Canteen.findById(canteenId);
    if (!canteen && items.length > 0) {
      const MenuItem = require('../models/MenuItem');
      const firstItem = await MenuItem.findById(items[0]);
      if (firstItem?.canteen) {
        canteen = await Canteen.findById(firstItem.canteen);
      }
    }
    const snapshot = buildSnapshot(canteen);
    // Use the resolved canteenId (may differ from the stale one sent by client)
    const resolvedCanteenId = canteen?._id || canteenId;

    // Look up student/user for snapshot
    const User = require('../models/User');
    const userDoc = await User.findById(userId);
    const uSnapshot = buildUserSnapshot(userDoc);

    const order = new Order({
      user: userId,
      items,
      quantities,
      total,
      canteenId: resolvedCanteenId,
      canteenSnapshot: snapshot,
      userSnapshot: uSnapshot,
      specialInstructions,
    });

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items', 'name price imageUrl')
      .populate('canteenId', 'name location contactPhone');

    res.status(201).json({
      message: 'Order placed successfully',
      order: enrichOrder(populated),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// ── Get order by ID ─────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items', 'name price imageUrl description')
      .populate('canteenId', 'name location contactPhone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'student' && order.user?._id?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'canteenOwner' && order.canteenId?._id?.toString() !== req.user.canteenId?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ order: enrichOrder(order) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// ── Get orders for the logged-in student ────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .populate('items', 'name price imageUrl canteen')
      .populate('canteenId', 'name location contactPhone')
      .sort({ createdAt: -1 });

    // For each order, attempt to recover canteen info if populate returned null
    const enriched = await Promise.all(orders.map(async (order) => {
      const o = enrichOrder(order);
      // Still no canteen info? Try to derive from the first item's canteen field
      if (!o.canteenId || typeof o.canteenId !== 'object' || !o.canteenId.name) {
        const firstItem = order.items?.[0];
        if (firstItem?.canteen) {
          const canteen = await Canteen.findById(firstItem.canteen).select('name location contactPhone').lean();
          if (canteen) {
            o.canteenId = canteen;
            // Patch the snapshot on the DB document too, so next fetch is fast
            await Order.findByIdAndUpdate(order._id, { canteenSnapshot: { name: canteen.name, location: canteen.location || '', contactPhone: canteen.contactPhone || '' } });
          }
        }
      }
      return o;
    }));

    res.status(200).json({ orders: enriched });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// ── Get all orders — admin sees all, owner sees their canteen ───────────────
// Admin optional filters: ?canteenId= ?studentId= ?dateFrom= ?dateTo=
const getAllOrders = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'canteenOwner') {
      query.canteenId = req.user.canteenId;
    } else if (req.user.role === 'superAdmin') {
      if (req.query.canteenId) query.canteenId = req.query.canteenId;
      if (req.query.studentId) query.user = req.query.studentId;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const to = new Date(req.query.dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items', 'name price imageUrl canteen')
      .populate('canteenId', 'name location contactPhone')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(orders.map(async (order) => {
      const o = enrichOrder(order);
      if (!o.canteenId || typeof o.canteenId !== 'object' || !o.canteenId.name) {
        const firstItem = order.items?.[0];
        if (firstItem?.canteen) {
          const canteen = await Canteen.findById(firstItem.canteen).select('name location contactPhone').lean();
          if (canteen) {
            o.canteenId = canteen;
            await Order.findByIdAndUpdate(order._id, { canteenSnapshot: { name: canteen.name, location: canteen.location || '', contactPhone: canteen.contactPhone || '' } });
          }
        }
      }
      return o;
    }));

    res.status(200).json({ orders: enriched });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// ── Update order status (admin / owner) ─────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const orderToUpdate = await Order.findById(id);
    if (!orderToUpdate) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== orderToUpdate.canteenId.toString()) {
      return res.status(403).json({ message: 'You can only update orders for your own canteen' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('user', 'name email')
      .populate('items', 'name price imageUrl')
      .populate('canteenId', 'name location contactPhone');

    res.status(200).json({
      message: 'Order status updated successfully',
      order: enrichOrder(order),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
};

// ── Cancel order ─────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'student' && order.user?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only cancel your own orders' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items', 'name price imageUrl')
      .populate('canteenId', 'name location contactPhone');

    res.status(200).json({
      message: 'Order cancelled successfully',
      order: enrichOrder(populated),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};