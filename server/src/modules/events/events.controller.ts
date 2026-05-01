// backend/src/modules/events/events.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { EventsService } from './events.service';

const eventsService = new EventsService();

export class EventsController {
  async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status = 'upcoming', limit = 20, page = 1 } = req.query;
      
      const result = await eventsService.getEvents({
        status: status as string,
        limit: parseInt(limit as string),
        page: parseInt(page as string),
        userId: req.user?.userId
      });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      
      const result = await eventsService.getEventById(
        eventId as string,
        req.user?.userId
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Event not found',
          errors: [{ field: 'eventId', message: 'Event does not exist' }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}