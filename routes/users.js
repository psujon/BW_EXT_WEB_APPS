const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id/role', userController.updateRole);
router.put('/:id/password', userController.updatePassword);
router.get('/permissions', userController.getAllPermissions);
router.put('/:id/permission', userController.toggleUserPermission);

module.exports = router;
