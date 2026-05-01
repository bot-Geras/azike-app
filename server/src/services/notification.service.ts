// backend/src/services/notification.service.ts
import { prisma} from '../../lib/prisma'
import { FCM_SERVER_KEY } from '../config/env';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

export class NotificationService {
  private readonly fcmUrl = 'https://fcm.googleapis.com/fcm/send';
  private readonly serverKey = FCM_SERVER_KEY!;

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { fcm_token: true }
    });

    if (!user?.fcm_token) {
      console.log(`No FCM token for user ${userId}`);
      return;
    }

    await this.sendFcmMessage([user.fcm_token], payload);

    // Store notification in database
    await prisma.user_notifications.create({
      data: {
        user_id: userId,
        title: payload.title,
        body: payload.body,
        data_payload: payload.data ?? undefined
      }
    });
  }

  async sendToMultipleUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    const users = await prisma.users.findMany({
      where: { 
        id: { in: userIds },
        fcm_token: { not: null }
      },
      select: { id: true, fcm_token: true }
    });

    const tokens = users.map((u: { fcm_token: any; }) => u.fcm_token!).filter(Boolean);

    if (tokens.length === 0) {
      console.log('No valid FCM tokens found');
      return;
    }

    // Send in batches of 500 (FCM limit)
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      await this.sendFcmMessage(batch, payload);
    }

    // Store notifications in database
    const notificationData = users.map((user: { id: any; }) => ({
      user_id: user.id,
      title: payload.title,
      body: payload.body,
      data_payload: payload.data ?? undefined
    }));

    await prisma.user_notifications.createMany({ data: notificationData });
  }

  async sendToAllMembers(payload: NotificationPayload): Promise<void> {
    const members = await prisma.users.findMany({
      where: {
        memberships: {
          some: {
            status: 'active',
            end_date: { gte: new Date() }
          }
        },
        fcm_token: { not: null }
      },
      select: { id: true, fcm_token: true }
    });

    const userIds = members.map((m: { id: any; }) => m.id);
    await this.sendToMultipleUsers(userIds, payload);
  }

  async sendToExpiredMembers(payload: NotificationPayload): Promise<void> {
    const expiredMembers = await prisma.users.findMany({
      where: {
        OR: [
          {
            memberships: {
              none: {}
            }
          },
          {
            memberships: {
              some: {
                OR: [
                  { status: 'expired' },
                  { end_date: { lt: new Date() } }
                ]
              }
            }
          }
        ],
        fcm_token: { not: null }
      },
      select: { id: true, fcm_token: true }
    });

    const userIds = expiredMembers.map((m: { id: any; }) => m.id);
    await this.sendToMultipleUsers(userIds, payload);
  }

  async sendEventReminder(eventId: string): Promise<void> {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        tickets: {
          where: { is_cancelled: false },
          include: { users: { select: { id: true } } }
        }
      }
    });

    if (!event) return;

    const userIds = event.tickets.map((t: { users: { id: any; }; }) => t.users.id);
    const payload: NotificationPayload = {
      title: 'Event Reminder',
      body: `${event.title} starts tomorrow!`,
      data: {
        screen: 'EventDetails',
        event_id: eventId
      }
    };

    await this.sendToMultipleUsers(userIds, payload);
  }

  private async sendFcmMessage(tokens: string[], payload: NotificationPayload): Promise<void> {
    try {
      const message = {
        registration_ids: tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.imageUrl
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'azike_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await fetch(this.fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.serverKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`FCM request failed with status ${response.status}`);
      }

      console.log(`✅ FCM sent to ${tokens.length} devices`);
    } catch (error) {
      console.error('FCM error:', error);
    }
  }
}