// backend/src/middleware/membershipGuard.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import {prisma} from '../../lib/prisma'

export interface MembershipRequest extends AuthRequest {
  membership?: any;
}

export const membershipGuard = async (
  req: MembershipRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: req.user!.userId,
        status: 'active',
        end_date: { gte: new Date() }
      }
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'Active membership required',
        errors: [{
          field: 'membership',
          message: 'Your membership has expired. Please renew to access member benefits.'
        }],
        data: {
          renewal_url: '/membership/renew',
          can_renew: true
        }
      });
      return;
    }

    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify membership',
      errors: [{ field: 'server', message: 'Internal server error' }]
    });
  }
};