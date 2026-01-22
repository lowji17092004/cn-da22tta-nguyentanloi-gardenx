const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin, requireAdminOrCollaborator } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// User routes
router.post('/', requireAuth, orderController.createOrder);
router.get('/my-orders', requireAuth, orderController.getMyOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.put('/:id/cancel', requireAuth, orderController.cancelOrder);

// Admin/Collaborator routes
router.get('/', requireAuth, requireAdminOrCollaborator, orderController.getOrders);
router.put('/:id/status', requireAuth, requireAdminOrCollaborator, orderController.updateOrderStatus);
router.put('/:id/payment', requireAuth, requireAdminOrCollaborator, orderController.updatePaymentStatus);
router.put('/:id/payment-status', requireAuth, requireAdminOrCollaborator, orderController.updatePaymentStatus);

// Admin only routes
router.get('/:id/next-statuses', requireAuth, requireAdmin, orderController.getNextStatuses);
router.delete('/:id', requireAuth, requireAdmin, orderController.deleteOrder);

// Payment webhooks
router.post('/payment/zalopay/webhook', orderController.zalopayWebhook);
router.post('/payment/zalopay/simulate/:orderId', orderController.simulateZalopay);

module.exports = router;
