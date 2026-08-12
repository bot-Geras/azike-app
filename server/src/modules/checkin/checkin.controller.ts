import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { CheckinService } from './checkin.service';

const checkinService = new CheckinService();

export class CheckinController {
  async scanAndCheckin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { qr_data, event_id } = req.body;
      
      const result = await checkinService.validateAndCheckin(
        qr_data,
        event_id,
        req.user!.userId
      );
      
      res.status(200).json({
        success: true,
        message: 'Check-in successful',
        data: result
      });
    } catch (error: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        INVALID_QR_FORMAT: { status: 400, message: 'Invalid QR code format' },
        QR_TAMPERED: { status: 400, message: 'QR code has been tampered with' },
        WRONG_EVENT: { status: 400, message: 'Ticket is for a different event' },
        TICKET_NOT_FOUND: { status: 404, message: 'Ticket not found' },
        TICKET_CANCELLED: { status: 400, message: 'Ticket has been cancelled' },
        ALREADY_CHECKED_IN: { status: 400, message: 'Ticket already used' }
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        res.status(mapped.status).json({
          success: false,
          message: mapped.message,
          errors: [{ field: 'qr_data', message: error.message }]
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Check-in failed',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }

  async getEventAttendees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      
      const result = await checkinService.getEventAttendees(eventId as string);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendees',
        errors: [{ field: 'server', message: 'Internal server error' }]
      });
    }
  }
}