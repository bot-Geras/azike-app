// backend/src/modules/checkin/checkin.service.ts
import { prisma} from '../../../lib/prisma'
import crypto from 'crypto';

export class CheckinService {
  async validateAndCheckin(qrData: string, eventId: string, staffUserId: string) {
    // Parse QR data
    const [prefix, payloadBase64, signature] = qrData.split('|');

    if (prefix !== 'AZIKE') {
      throw new Error('INVALID_QR_FORMAT');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.QR_SECRET!)
      .update(Buffer.from(payloadBase64, 'base64').toString())
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('QR_TAMPERED');
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    const { ticket_id, event_id, user_id } = payload;

    // Verify event matches
    if (event_id !== eventId) {
      throw new Error('WRONG_EVENT');
    }

    // Find ticket
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticket_id },
      include: {
        events: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_picture_url: true
          }
        }
      }
    });

    if (!ticket) {
      throw new Error('TICKET_NOT_FOUND');
    }

    if (ticket.is_cancelled) {
      throw new Error('TICKET_CANCELLED');
    }

    if (ticket.is_checked_in) {
      throw new Error('ALREADY_CHECKED_IN');
    }

    // Get membership status
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: ticket.user_id,
        status: 'active',
        end_date: { gte: new Date() }
      }
    });

    // Perform check-in
    const checkedInAt = new Date();

    await prisma.tickets.update({
      where: { id: ticket_id },
      data: {
        is_checked_in: true,
        checked_in_at: checkedInAt,
        checked_in_by: staffUserId
      }
    });

    return {
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      attendee: {
        user_id: ticket.users.id,
        first_name: ticket.users.first_name,
        last_name: ticket.users.last_name,
        profile_picture_url: ticket.users.profile_picture_url,
        membership_status: membership?.status || 'expired'
      },
      ticket_type: ticket.ticket_type,
      checked_in_at: checkedInAt,
      checked_in_by: 'Staff',
      event_title: ticket.events.title
    };
  }

  async getEventAttendees(eventId: string) {
    const tickets = await prisma.tickets.findMany({
      where: {
        event_id: eventId,
        is_cancelled: false
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            profile_picture_url: true
          }
        }
      },
      orderBy: { purchased_at: 'asc' }
    });

    const stats = {
      total_tickets: tickets.length,
      checked_in: tickets.filter((t: { is_checked_in: any; }) => t.is_checked_in).length,
      not_checked_in: tickets.filter((t: { is_checked_in: any; }) => !t.is_checked_in).length,
      ticket_types: {
        free_entitlement: tickets.filter((t: { ticket_type: string; }) => t.ticket_type === 'free_entitlement').length,
        member_discounted: tickets.filter((t: { ticket_type: string; }) => t.ticket_type === 'member_discounted').length,
        non_member_standard: tickets.filter((t: { ticket_type: string; }) => t.ticket_type === 'non_member_standard').length
      }
    };

    return {
      event_id: eventId,
      stats,
      attendees: tickets.map((t: { id: any; ticket_number: any; users: any; ticket_type: any; price_paid: any; is_checked_in: any; checked_in_at: any; purchased_at: any; }) => ({
        ticket_id: t.id,
        ticket_number: t.ticket_number,
        attendee: t.users,
        ticket_type: t.ticket_type,
        price_paid: Number(t.price_paid),
        is_checked_in: t.is_checked_in,
        checked_in_at: t.checked_in_at,
        purchased_at: t.purchased_at
      }))
    };
  }
}