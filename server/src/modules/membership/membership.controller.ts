// backend/src/modules/membership/membership.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { MembershipService } from './membership.service';

const membershipService = new MembershipService();

export class MembershipController {
  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await membershipService.getMembershipStatus(req.user!.userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'no_membership_found') {
        res.status(404).json({
          success: false,
          message: 'No membership found',
          errors: [{ field: 'membership', message: 'No membership record found' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch membership status',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await membershipService.getDigitalCard(req.user!.userId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'no_active_membership') {
        res.status(403).json({
          success: false,
          message: 'No active membership',
          errors: [{
            field: 'membership',
            message: 'You need an active membership to view your digital card'
          }],
          data: {
            renewal_url: '/membership/renew'
          }
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch digital card',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}