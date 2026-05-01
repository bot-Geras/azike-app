// backend/src/modules/admin/admin.service.ts
import { prisma} from '../../../lib/prisma'
import { Prisma } from '../../../generated/prisma/client';
import { NotificationService } from '../../services/notification.service';
import { AnnouncementsService } from '../announcements/announcements.service';

const notificationService = new NotificationService();
const announcementsService = new AnnouncementsService();

export class AdminService {
  async getEvents(options: {
    status?: string;
    limit?: number;
    page?: number;
  }) {
    const { status, limit = 20, page = 1 } = options;
    const offset = (page - 1) * limit;

    const where: Prisma.eventsWhereInput = {};
    if (status) {
      where.status = status as any;
    }

    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        orderBy: { start_datetime: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { tickets: true } },
          users: { select: { first_name: true, last_name: true } }
        }
      }),
      prisma.events.count({ where })
    ]);

    return {
      events: events.map((e: { id: any; title: any; location: any; start_datetime: any; status: any; member_price: any; non_member_price: any; max_capacity: any; current_bookings: any; _count: { tickets: any; }; users: { first_name: any; last_name: any; }; created_at: any; }) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        start_datetime: e.start_datetime,
        status: e.status,
        member_price: Number(e.member_price),
        non_member_price: Number(e.non_member_price),
        max_capacity: e.max_capacity,
        current_bookings: e.current_bookings,
        ticket_count: e._count.tickets,
        created_by: `${e.users.first_name} ${e.users.last_name}`,
        created_at: e.created_at
      })),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        limit
      }
    };
  }

  async createEvent(data: {
    title: string;
    description?: string;
    location: string;
    start_datetime: Date;
    end_datetime: Date;
    registration_deadline?: Date;
    banner_image_url?: string;
    member_price: number;
    non_member_price: number;
    is_free_for_members: boolean;
    max_capacity?: number;
    status: string;
    visibility: string;
    created_by: string;
  }) {
    const event = await prisma.events.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime,
        registration_deadline: data.registration_deadline,
        banner_image_url: data.banner_image_url,
        member_price: data.member_price,
        non_member_price: data.non_member_price,
        is_free_for_members: data.is_free_for_members,
        max_capacity: data.max_capacity,
        status: data.status as any,
        visibility: data.visibility as any,
        created_by: data.created_by
      }
    });

    return event;
  }

  async updateEvent(eventId: string, data: Partial<{
    title: string;
    description: string;
    location: string;
    start_datetime: Date;
    end_datetime: Date;
    registration_deadline: Date;
    banner_image_url: string;
    member_price: number;
    non_member_price: number;
    is_free_for_members: boolean;
    max_capacity: number;
    status: string;
    visibility: string;
  }>) {
    const event = await prisma.events.update({
      where: { id: eventId },
      data: {
        ...data,
        updated_at: new Date()
      }
    });

    return event;
  }

  async deleteEvent(eventId: string) {
    // Soft delete - just mark as cancelled
    const event = await prisma.events.update({
      where: { id: eventId },
      data: {
        status: 'cancelled',
        updated_at: new Date()
      }
    });

    return event;
  }

  async getAnnouncements(options: {
    limit?: number;
    page?: number;
  }) {
    const { limit = 20, page = 1 } = options;
    const offset = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          users: { select: { first_name: true, last_name: true } }
        }
      }),
      prisma.announcements.count()
    ]);

    return {
      announcements: announcements.map((a: { id: any; title: any; body: any; image_url: any; target_audience: any; target_event_id: any; send_push_notification: any; push_notification_sent: any; scheduled_for: any; expires_at: any; users: { first_name: any; last_name: any; }; created_at: any; }) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        image_url: a.image_url,
        target_audience: a.target_audience,
        target_event_id: a.target_event_id,
        send_push_notification: a.send_push_notification,
        push_notification_sent: a.push_notification_sent,
        scheduled_for: a.scheduled_for,
        expires_at: a.expires_at,
        created_by: `${a.users.first_name} ${a.users.last_name}`,
        created_at: a.created_at
      })),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        limit
      }
    };
  }

  async createAnnouncement(data: {
    title: string;
    body: string;
    image_url?: string;
    target_audience: string;
    target_event_id?: string;
    send_push_notification: boolean;
    scheduled_for?: Date;
    expires_at?: Date;
    created_by: string;
  }) {
    return await announcementsService.createAnnouncement({
      title: data.title,
      body: data.body,
      imageUrl: data.image_url,
      targetAudience: data.target_audience,
      targetEventId: data.target_event_id,
      sendPush: data.send_push_notification,
      createdBy: data.created_by,
      scheduledFor: data.scheduled_for,
      expiresAt: data.expires_at
    });
  }

  async getDashboardStats() {
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      expiringThisMonth,
      newThisMonth,
      totalEvents,
      upcomingEvents,
      revenueYTD,
      revenueThisMonth,
      recentTransactions
    ] = await Promise.all([
      prisma.users.count(),
      prisma.memberships.count({ 
        where: { 
          status: 'active',
          end_date: { gte: new Date() }
        } 
      }),
      prisma.memberships.count({
        where: {
          OR: [
            { status: 'expired' },
            { end_date: { lt: new Date() } }
          ]
        }
      }),
      prisma.memberships.count({
        where: {
          status: 'active',
          end_date: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.users.count({
        where: {
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.events.count(),
      prisma.events.count({
        where: {
          status: 'published',
          start_datetime: { gte: new Date() }
        }
      }),
      prisma.transactions.aggregate({
        where: {
          status: 'completed',
          created_at: { gte: new Date(new Date().getFullYear(), 0, 1) }
        },
        _sum: { amount: true }
      }),
      prisma.transactions.aggregate({
        where: {
          status: 'completed',
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        _sum: { amount: true }
      }),
      prisma.transactions.findMany({
        where: { status: 'completed' },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          users: { select: { first_name: true, last_name: true } }
        }
      })
    ]);

    const membershipRevenue = await prisma.transactions.aggregate({
      where: {
        status: 'completed',
        transaction_type: 'membership',
        created_at: { gte: new Date(new Date().getFullYear(), 0, 1) }
      },
      _sum: { amount: true }
    });

    const eventRevenue = await prisma.transactions.aggregate({
      where: {
        status: 'completed',
        transaction_type: 'event_ticket',
        created_at: { gte: new Date(new Date().getFullYear(), 0, 1) }
      },
      _sum: { amount: true }
    });

    const renewalRate = activeMembers > 0 
      ? ((activeMembers / (activeMembers + expiredMembers)) * 100).toFixed(1)
      : '0';

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        expired: expiredMembers,
        expiring_this_month: expiringThisMonth,
        new_this_month: newThisMonth,
        renewal_rate_percent: parseFloat(renewalRate)
      },
      events: {
        total_published: totalEvents,
        upcoming: upcomingEvents,
        total_attendees_ytd: 0, // Would need aggregation
        average_attendance_rate: 0
      },
      revenue: {
        total_ytd: revenueYTD._sum.amount || 0,
        this_month: revenueThisMonth._sum.amount || 0,
        membership_renewals: membershipRevenue._sum.amount || 0,
        event_tickets: eventRevenue._sum.amount || 0,
        currency: 'KES'
      },
      recent_transactions: recentTransactions.map((t: { id: any; users: { first_name: any; last_name: any; }; amount: any; transaction_type: any; status: any; created_at: any; }) => ({
        transaction_id: t.id,
        user: `${t.users.first_name} ${t.users.last_name}`,
        amount: Number(t.amount),
        type: t.transaction_type,
        status: t.status,
        created_at: t.created_at
      }))
    };
  }
}