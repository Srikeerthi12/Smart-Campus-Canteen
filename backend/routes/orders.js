const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleAuth');

// ── Specific / literal routes MUST come before parametric /:id ──────────────
router.get('/user/my-orders', authMiddleware, orderController.getUserOrders);
router.get('/', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), orderController.getAllOrders);

router.post('/', authMiddleware, orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id/status', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), orderController.updateOrderStatus);
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;