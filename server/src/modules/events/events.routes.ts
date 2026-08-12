import { Router } from 'express';
import { EventsController } from './events.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const eventsController = new EventsController();

router.get('/', authMiddleware, eventsController.getEvents.bind(eventsController));
router.get('/:eventId', authMiddleware, eventsController.getEventById.bind(eventsController));

export default router;