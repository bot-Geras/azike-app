// backend/src/modules/payments/payments.routes.ts
import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const paymentsController = new PaymentsController();

// Public webhook (no auth required)
router.post('/mpesa/callback', paymentsController.mpesaCallback.bind(paymentsController));

// Protected routes
router.post('/mpesa/stkpush', authMiddleware, paymentsController.initiateStkPush.bind(paymentsController));
router.get('/transaction/:transaction_id/status', authMiddleware, paymentsController.getTransactionStatus.bind(paymentsController));
router.get('/transactions', authMiddleware, paymentsController.getUserTransactions.bind(paymentsController));

export default router;