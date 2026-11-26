const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', statsController.getStats);
router.get('/monthly-style-summary', statsController.getMonthlyStyleSummary);

module.exports = router;
