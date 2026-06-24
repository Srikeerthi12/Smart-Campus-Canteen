const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');


const authorizeRoles = require('../middleware/roleAuth');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.get('/user/my-orders', authMiddleware, orderController.getUserOrders);
router.put('/:id/status', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), orderController.updateOrderStatus);
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

// Admin/Owner only
router.get('/', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), orderController.getAllOrders);

module.exports = router;