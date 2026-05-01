// backend/src/modules/payments/payments.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { PaymentsService } from './payments.service';

const paymentsService = new PaymentsService();

export class PaymentsController {
  async initiateStkPush(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { phone_number, amount, reference_type, reference_id, description } = req.body;
      
      const result = await paymentsService.initiateStkPush({
        phone_number,
        amount,
        reference_type,
        reference_id,
        description,
        user_id: req.user!.userId
      });
      
      res.status(200).json({
        success: true,
        message: `STK Push sent to ${phone_number}`,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'STK_PUSH_FAILED') {
        res.status(400).json({
          success: false,
          message: 'Failed to initiate M-Pesa payment',
          errors: [{
            field: 'payment',
            message: 'Could not send STK Push. Please try again.'
          }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Payment initiation failed',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
  
  async mpesaCallback(req: Request, res: Response): Promise<void> {
    try {
      console.log('📨 M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));
      
      const callbackData = req.body.Body.stkCallback;
      
      await paymentsService.processCallback(callbackData);
      
      // Always return success to Safaricom
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    } catch (error) {
      console.error('❌ Callback processing error:', error);
      
      // Still return success to prevent Safaricom retries
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    }
  }
  
  async getTransactionStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { transaction_id } = req.params;
      
      const result = await paymentsService.getTransactionStatus(
        transaction_id as string,
        req.user!.userId
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'TRANSACTION_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
          errors: [{ field: 'transaction_id', message: 'Transaction does not exist' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction status',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
  
  async getUserTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      const transactions = await paymentsService.getUserTransactions(
        req.user!.userId,
        limit
      );
      
      res.status(200).json({
        success: true,
        data: { transactions }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}