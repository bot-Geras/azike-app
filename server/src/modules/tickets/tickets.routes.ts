import { Router } from 'express';
import { TicketsController } from './tickets.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const ticketsController = new TicketsController();

router.post('/events/:eventId/purchase', authMiddleware, ticketsController.purchaseTicket.bind(ticketsController));
router.get('/my', authMiddleware, ticketsController.getMyTickets.bind(ticketsController));

export default router;