// backend/src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new AdminController();

// All admin routes require authentication
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', controller.getDashboardStats.bind(controller));

// Events management
router.get('/events', controller.getEvents.bind(controller));
router.post('/events', controller.createEvent.bind(controller));
router.put('/events/:id', controller.updateEvent.bind(controller));
router.delete('/events/:id', controller.deleteEvent.bind(controller));

// Announcements management
router.get('/announcements', controller.getAnnouncements.bind(controller));
router.post('/announcements', controller.createAnnouncement.bind(controller));

export default router;