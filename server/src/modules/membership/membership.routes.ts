// backend/src/modules/membership/membership.routes.ts (Updated)
import { Router } from 'express';
import { MembershipController } from './membership.controller';
import { MembershipRenewalController } from './membership-renewal.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const membershipController = new MembershipController();
const renewalController = new MembershipRenewalController();

router.get('/status', authMiddleware, membershipController.getStatus.bind(membershipController));
router.get('/card', authMiddleware, membershipController.getCard.bind(membershipController));
router.get('/renewal-options', authMiddleware, renewalController.getRenewalOptions.bind(renewalController));
router.post('/renew', authMiddleware, renewalController.initiateRenewal.bind(renewalController));

export default router;