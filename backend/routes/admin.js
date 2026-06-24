const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleAuth');

router.use(authMiddleware);
router.use(authorizeRoles('superAdmin'));

router.post('/owners', adminController.createCanteenOwner);
router.get('/owners', adminController.getCanteenOwners);

module.exports = router;
