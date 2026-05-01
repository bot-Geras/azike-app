// backend/src/modules/tickets/tickets.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { TicketsService } from './tickets.service';

const ticketsService = new TicketsService();

export class TicketsController {
  async purchaseTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { use_free_entitlement, phone_number, attendee_details } = req.body;
      
      const result = await ticketsService.purchaseTicket({
        eventId,
        userId: req.user!.userId,
        useFreeEntitlement: use_free_entitlement || false,
        phoneNumber: phone_number,
        attendeeDetails: attendee_details
      });
      
      if ('transaction_id' in result) {
        res.status(200).json({
          success: true,
          message: 'M-Pesa payment initiated. Complete payment to receive ticket.',
          data: result
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Free ticket claimed successfully!',
          data: result
        });
      }
    } catch (error: any) {
      const errorMap: Record<string, { status: number; message: string; field: string }> = {
        EVENT_NOT_FOUND: { status: 404, message: 'Event not found', field: 'eventId' },
        EVENT_FULL: { status: 400, message: 'Event is full', field: 'event' },
        REGISTRATION_CLOSED: { status: 400, message: 'Registration deadline passed', field: 'event' },
        ALREADY_BOOKED: { status: 409, message: 'Already booked for this event', field: 'event' },
        MEMBERS_ONLY: { status: 403, message: 'This event is for members only', field: 'membership' },
        MEMBER_REQUIRED_FOR_FREE: { status: 403, message: 'Active membership required for free tickets', field: 'membership' },
        NO_FREE_ENTITLEMENTS: { status: 403, message: 'No free entitlements remaining', field: 'entitlement' }
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        res.status(mapped.status).json({
          success: false,
          message: mapped.message,
          errors: [{ field: mapped.field, message: error.message }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to purchase ticket',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getMyTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status = 'upcoming' } = req.query;
      
      const result = await ticketsService.getUserTickets(
        req.user!.userId,
        status as string
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}