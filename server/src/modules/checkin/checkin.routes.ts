// backend/src/modules/checkin/checkin.routes.ts
import { Router } from 'express';
import { CheckinController } from './checkin.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const checkinController = new CheckinController();

router.post('/scan', authMiddleware, checkinController.scanAndCheckin.bind(checkinController));
router.get('/events/:eventId/attendees', authMiddleware, checkinController.getEventAttendees.bind(checkinController));

export default router;