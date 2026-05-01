// backend/src/modules/announcements/announcements.routes.ts
import { Router } from 'express';
import { AnnouncementsController } from './announcements.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new AnnouncementsController();

// Public routes (still require auth to know user context)
router.get('/', authMiddleware, controller.getAnnouncements.bind(controller));

// User notification routes
router.get('/notifications', authMiddleware, controller.getNotifications.bind(controller));
router.patch('/notifications/:id/read', authMiddleware, controller.markAsRead.bind(controller));
router.patch('/notifications/read-all', authMiddleware, controller.markAllAsRead.bind(controller));

export default router;