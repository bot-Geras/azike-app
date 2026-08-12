import { prisma} from '../../../lib/prisma'
import { NotificationService } from '../../services/notification.service';

const notificationService = new NotificationService();

export class AnnouncementsService {
  async createAnnouncement(data: {
    title: string;
    body: string;
    imageUrl?: string;
    targetAudience: string;
    targetEventId?: string;
    sendPush: boolean;
    createdBy: string;
    scheduledFor?: Date;
    expiresAt?: Date;
  }) {
    const announcement = await prisma.announcements.create({
      data: {
        title: data.title,
        body: data.body,
        image_url: data.imageUrl,
        target_audience: data.targetAudience,
        target_event_id: data.targetEventId,
        send_push_notification: data.sendPush,
        created_by: data.createdBy,
        scheduled_for: data.scheduledFor,
        expires_at: data.expiresAt
      }
    });

    // Send push notification if requested and not scheduled
    if (data.sendPush && !data.scheduledFor) {
      await this.sendAnnouncementNotification(announcement.id);
    }

    return announcement;
  }

  async sendAnnouncementNotification(announcementId: string): Promise<void> {
    const announcement = await prisma.announcements.findUnique({
      where: { id: announcementId }
    });

    if (!announcement) return;

    const payload = {
      title: announcement.title,
      body: announcement.body,
      imageUrl: announcement.image_url || undefined,
      data: {
        screen: 'AnnouncementDetail',
        announcement_id: announcementId
      }
    };

    // Send based on target audience
    switch (announcement.target_audience) {
      case 'all':
        // Get all users
        const allUsers = await prisma.users.findMany({
          where: { fcm_token: { not: null } },
          select: { id: true }
        });
        await notificationService.sendToMultipleUsers(
          allUsers.map((u: { id: any; }) => u.id),
          payload
        );
        break;

      case 'members_only':
        await notificationService.sendToAllMembers(payload);
        break;

      case 'expired_members':
        await notificationService.sendToExpiredMembers(payload);
        break;

      case 'event_attendees':
        if (announcement.target_event_id) {
          const attendees = await prisma.tickets.findMany({
            where: {
              event_id: announcement.target_event_id,
              is_cancelled: false
            },
            select: { user_id: true }
          });
          await notificationService.sendToMultipleUsers(
            attendees.map((a: { user_id: any; }) => a.user_id),
            payload
          );
        }
        break;
    }

    // Mark as sent
    await prisma.announcements.update({
      where: { id: announcementId },
      data: {
        push_notification_sent: true,
        push_notification_sent_at: new Date()
      }
    });
  }

  async getAnnouncements(options: {
    userId?: string;
    limit?: number;
    includeExpired?: boolean;
  }) {
    const { userId, limit = 20, includeExpired = false } = options;

    const where: any = {};
    
    if (!includeExpired) {
      where.OR = [
        { expires_at: null },
        { expires_at: { gte: new Date() } }
      ];
    }

    const announcements = await prisma.announcements.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return announcements.map((a: { id: any; title: any; body: any; image_url: any; target_audience: any; users: { first_name: any; last_name: any; }; created_at: any; expires_at: any; }) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      image_url: a.image_url,
      target_audience: a.target_audience,
      created_by: `${a.users.first_name} ${a.users.last_name}`,
      created_at: a.created_at,
      expires_at: a.expires_at
    }));
  }

  async getUserNotifications(userId: string, limit: number = 50) {
    const notifications = await prisma.user_notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    const unreadCount = await prisma.user_notifications.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return {
      notifications: notifications.map((n: { id: any; title: any; body: any; data_payload: any; is_read: any; created_at: any; }) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        data: n.data_payload,
        is_read: n.is_read,
        created_at: n.created_at
      })),
      unread_count: unreadCount
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.user_notifications.updateMany({
      where: {
        id: notificationId,
        user_id: userId
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.user_notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });
  }
}