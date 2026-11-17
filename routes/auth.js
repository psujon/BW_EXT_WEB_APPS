const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/auth');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getProfile);
router.get('/stats', authenticateToken, authController.getStats);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
