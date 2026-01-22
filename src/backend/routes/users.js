const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Admin routes
router.get('/', requireAuth, requireAdmin, userController.getAllUsers);
router.get('/:id', requireAuth, requireAdmin, userController.getUserById);
router.post('/', requireAuth, requireAdmin, userController.createUser);
router.put('/:id', requireAuth, requireAdmin, userController.updateUserRole);
router.get('/:id/order-count', requireAuth, requireAdmin, userController.getUserOrderCount);
router.put('/:id/lock', requireAuth, requireAdmin, userController.lockUser);
router.put('/:id/unlock', requireAuth, requireAdmin, userController.unlockUser);
router.delete('/:id', requireAuth, requireAdmin, userController.deleteUser);

module.exports = router;
