const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

const authorizeRoles = require('../middleware/roleAuth');

// Public routes
router.get('/', menuController.getAllMenuItems);
router.get('/canteen/:canteenId', menuController.getMenuItemsByCanteen);
router.get('/:id', menuController.getMenuItemById);

// Protected routes
router.post('/', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), menuController.createMenuItem);
router.put('/:id', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), menuController.updateMenuItem);
router.delete('/:id', authMiddleware, authorizeRoles('canteenOwner', 'superAdmin'), menuController.deleteMenuItem);

module.exports = router;