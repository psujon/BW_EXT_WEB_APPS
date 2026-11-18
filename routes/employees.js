const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateToken = require('../middlewares/auth');

router.get('/external-search', authenticateToken, employeeController.searchExternalEmployee);
router.post('/save-external', authenticateToken, employeeController.saveExternalEmployee);
router.get('/', authenticateToken, employeeController.getAllActive);
router.post('/', authenticateToken, employeeController.create);
router.put('/:id', authenticateToken, employeeController.update);
router.delete('/:id', authenticateToken, employeeController.delete);

module.exports = router;
