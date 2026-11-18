const express = require('express');
const router = express.Router();
const pieceRateController = require('../controllers/pieceRateController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', pieceRateController.getAll);
router.post('/bulk-import-from-production', pieceRateController.bulkImportFromProduction);
router.post('/', pieceRateController.create);
router.put('/:id', pieceRateController.update);
router.delete('/:id', pieceRateController.delete);

module.exports = router;
