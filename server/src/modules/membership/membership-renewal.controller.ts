import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { MembershipRenewalService } from './membership-renewal.service';

const renewalService = new MembershipRenewalService();

export class MembershipRenewalController {
  async getRenewalOptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const options = await renewalService.getRenewalOptions();
      
      res.status(200).json({
        success: true,
        data: { packages: options }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch renewal options',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
  
  async initiateRenewal(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { package_id, phone_number } = req.body;
      
      const result = await renewalService.initiateRenewal(
        req.user!.userId,
        package_id,
        phone_number
      );
      
      res.status(200).json({
        success: true,
        message: 'M-Pesa STK Push initiated. Please enter your PIN.',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'INVALID_PACKAGE') {
        res.status(400).json({
          success: false,
          message: 'Invalid membership package',
          errors: [{ field: 'package_id', message: 'Selected package does not exist' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to initiate renewal',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}