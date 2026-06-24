// router.post('/register', authController.register);
//         ↑ Method    ↑ URL        ↑ Controller function

//  Usage: POST http://localhost:5000/api/auth/register

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
