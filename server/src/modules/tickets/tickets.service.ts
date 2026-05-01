// backend/src/modules/tickets/tickets.service.ts
//  import prisma from '../../config/database';
 import { prisma} from '../../../lib/prisma'
import { Prisma } from '../../../generated/prisma/client';
import { PaymentsService } from '../payments/payments.service';
import crypto from 'crypto';
import QRCode from 'qrcode';

const paymentsService = new PaymentsService();

export class TicketsService {
  async purchaseTicket(data: {
    eventId: string;
    userId: string;
    useFreeEntitlement: boolean;
    phoneNumber: string;
    attendeeDetails?: any;
  }) {
    const { eventId, userId, useFreeEntitlement, phoneNumber, attendeeDetails } = data;

    // Get event
    const event = await prisma.events.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // Check capacity
    if (event.max_capacity && event.current_bookings >= event.max_capacity) {
      throw new Error('EVENT_FULL');
    }

    // Check registration deadline
    if (event.registration_deadline && new Date() > event.registration_deadline) {
      throw new Error('REGISTRATION_CLOSED');
    }

    // Check if user already has ticket
    const existingTicket = await prisma.tickets.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
        is_cancelled: false
      }
    });

    if (existingTicket) {
      throw new Error('ALREADY_BOOKED');
    }

    // Get user membership
    const membership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        end_date: { gte: new Date() }
      }
    });

    const isMember = membership !== null;

    // Check members-only event
    if (event.visibility === 'members_only' && !isMember) {
      throw new Error('MEMBERS_ONLY');
    }

    // Determine price and ticket type
    let price: number;
    let ticketType: string;
    let usedEntitlement = false;

    if (useFreeEntitlement) {
      if (!isMember) {
        throw new Error('MEMBER_REQUIRED_FOR_FREE');
      }
      if (membership.free_events_used >= membership.free_events_limit) {
        throw new Error('NO_FREE_ENTITLEMENTS');
      }
      price = 0;
      ticketType = 'free_entitlement';
      usedEntitlement = true;
    } else if (isMember) {
      price = Number(event.member_price);
      ticketType = 'member_discounted';
    } else {
      price = Number(event.non_member_price);
      ticketType = 'non_member_standard';
    }

    // If price is 0, create ticket immediately
    if (price === 0) {
      return await this.createFreeTicket({
        event,
        userId,
        membershipId: membership?.id ?? null,
        ticketType,
        usedEntitlement,
        attendeeDetails
      });
    }

    // For paid tickets, initiate M-Pesa payment
    const paymentResult = await paymentsService.initiateStkPush({
      phone_number: phoneNumber,
      amount: price,
      reference_type: 'event_ticket',
      reference_id: eventId,
      description: `AZIKE ${event.title.substring(0, 13)}`,
      user_id: userId
    });

    return {
      transaction_id: paymentResult.transaction_id,
      checkout_request_id: paymentResult.checkout_request_id,
      amount: price,
      status: 'pending_payment',
      polling_url: `/payments/transaction/${paymentResult.transaction_id}/status`
    };
  }

  private async createFreeTicket(data: {
    event: any;
    userId: string;
    membershipId: string | null;
    ticketType: string;
    usedEntitlement: boolean;
    attendeeDetails?: any;
  }) {
    const { event, userId, membershipId, ticketType, usedEntitlement, attendeeDetails } = data;

    return await prisma.$transaction(async (tx: { tickets: { create: (arg0: { data: { id: `${string}-${string}-${string}-${string}-${string}`; event_id: any; user_id: string; ticket_number: string; qr_code_data: string; ticket_type: string; price_paid: number; used_membership_entitlement: boolean; membership_id_at_time: string | null; purchased_at: Date; }; }) => any; }; events: { update: (arg0: { where: { id: any; }; data: { current_bookings: { increment: number; }; }; }) => any; }; memberships: { update: (arg0: { where: { id: string; }; data: { free_events_used: { increment: number; }; last_free_event_date: Date; }; }) => any; }; }) => {
      // Generate ticket number
      const ticketNumber = await this.generateTicketNumber(tx);

      // Generate QR data
      const ticketId = crypto.randomUUID();
      const qrPayload = {
        ticket_id: ticketId,
        event_id: event.id,
        user_id: userId,
        timestamp: Date.now()
      };

      const signature = crypto
        .createHmac('sha256', process.env.QR_SECRET!)
        .update(JSON.stringify(qrPayload))
        .digest('hex');

      const qrData = `AZIKE|${Buffer.from(JSON.stringify(qrPayload)).toString('base64')}|${signature}`;

      // Create ticket
      const ticket = await tx.tickets.create({
        data: {
          id: ticketId,
          event_id: event.id,
          user_id: userId,
          ticket_number: ticketNumber,
          qr_code_data: qrData,
          ticket_type: ticketType,
          price_paid: 0,
          used_membership_entitlement: usedEntitlement,
          membership_id_at_time: membershipId,
          purchased_at: new Date()
        }
      });

      // Update event capacity
      await tx.events.update({
        where: { id: event.id },
        data: { current_bookings: { increment: 1 } }
      });

      // Update membership entitlement if used
      if (usedEntitlement && membershipId) {
        await tx.memberships.update({
          where: { id: membershipId },
          data: {
            free_events_used: { increment: 1 },
            last_free_event_date: new Date()
          }
        });
      }

      // Generate QR image
      const qrImageUrl = await QRCode.toDataURL(qrData);

      return {
        ticket_id: ticket.id,
        ticket_number: ticketNumber,
        event_id: event.id,
        event_title: event.title,
        ticket_type: ticketType,
        price_paid: 0,
        qr_code_data: qrData,
        qr_code_image_url: qrImageUrl,
        entitlement_remaining: membershipId ? 
          await this.getRemainingEntitlements(tx, membershipId) : 0,
        checked_in: false
      };
    });
  }

  private async generateTicketNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.tickets.count({
      where: {
        purchased_at: {
          gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    });
    return `AZIKE-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async getRemainingEntitlements(tx: any, membershipId: string): Promise<number> {
    const membership = await tx.memberships.findUnique({
      where: { id: membershipId }
    });
    return membership.free_events_limit - membership.free_events_used;
  }

  async processEventTicketPayment(transactionId: string): Promise<void> {
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId },
      include: { users: true }
    });

    if (!transaction || transaction.transaction_type !== 'event_ticket') {
      return;
    }

    const eventId = transaction.reference_id!;
    const userId = transaction.user_id;

    await this.createFreeTicket({
      event: { id: eventId },
      userId,
      membershipId: null, // Will be looked up in createFreeTicket
      ticketType: 'member_discounted', // Will be determined in createFreeTicket
      usedEntitlement: false,
      attendeeDetails: null
    });
  }

  async getUserTickets(userId: string, status: string = 'upcoming') {
    const where: Prisma.ticketsWhereInput = {
      user_id: userId,
      is_cancelled: false,
      ...(status === 'upcoming' ? {
        events: { start_datetime: { gte: new Date() } }
      } : {}),
      ...(status === 'past' ? {
        events: { end_datetime: { lt: new Date() } }
      } : {})
    };

    const tickets = await prisma.tickets.findMany({
      where,
      include: {
        events: {
          select: {
            id: true,
            title: true,
            start_datetime: true,
            location: true,
            banner_image_url: true
          }
        }
      },
      orderBy: { purchased_at: 'desc' }
    });

    return {
      tickets: tickets.map((t: { id: any; ticket_number: any; events: any; ticket_type: any; price_paid: any; qr_code_data: any; qr_code_image_url: any; is_checked_in: any; checked_in_at: any; purchased_at: any; }) => ({
        ticket_id: t.id,
        ticket_number: t.ticket_number,
        event: t.events,
        ticket_type: t.ticket_type,
        price_paid: Number(t.price_paid),
        qr_code_data: t.qr_code_data,
        qr_code_image_url: t.qr_code_image_url,
        is_checked_in: t.is_checked_in,
        checked_in_at: t.checked_in_at,
        purchased_at: t.purchased_at
      })),
      summary: {
        total_tickets: tickets.length,
        upcoming_tickets: tickets.filter((t: { events: { start_datetime: string | number | Date; }; }) => 
          new Date(t.events.start_datetime) >= new Date()
        ).length,
        past_tickets: tickets.filter((t: { events: { start_datetime: string | number | Date; }; }) => 
          new Date(t.events.start_datetime) < new Date()
        ).length
      }
    };
  }
}