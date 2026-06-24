const express = require('express');
const router = express.Router();
const canteenController = require('../controllers/canteenController');
const authMiddleware = require('../middleware/auth');

const authorizeRoles = require('../middleware/roleAuth');

// Public routes
router.get('/', canteenController.getAllCanteens);
router.get('/:id', canteenController.getCanteenById);

// Protected routes
router.post('/', authMiddleware, authorizeRoles('superAdmin'), canteenController.createCanteen);
router.put('/:id', authMiddleware, authorizeRoles('superAdmin', 'canteenOwner'), canteenController.updateCanteen);
router.delete('/:id', authMiddleware, authorizeRoles('superAdmin'), canteenController.deleteCanteen);

module.exports = router;
