import cron from 'node-cron';
import {prisma} from '../../lib/prisma'
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export function initializeCronJobs() {
  // Auto-expire memberships - Daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running membership expiry job...');
    
    const expired = await prisma.memberships.updateMany({
      where: {
        status: 'active',
        end_date: { lt: new Date() }
      },
      data: { status: 'expired' }
    });
    
    console.log(`✅ Expired ${expired.count} memberships`);
  });

  // Send expiry reminders - Daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('📧 Sending expiry reminders...');
    
    const expiringSoon = await prisma.memberships.findMany({
      where: {
        status: 'active',
        end_date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        users: {
          select: { id: true, first_name: true }
        }
      }
    });

    for (const membership of expiringSoon) {
      const daysLeft = Math.ceil(
        (new Date(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      await notificationService.sendToUser(membership.users.id, {
        title: 'Membership Expiring Soon',
        body: `Hi ${membership.users.first_name}, your membership expires in ${daysLeft} days. Renew now to keep your benefits!`,
        data: {
          screen: 'MembershipRenewal',
          membership_id: membership.id
        }
      });
    }
    
    console.log(`✅ Sent ${expiringSoon.length} expiry reminders`);
  });

  // Event reminders - Daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('📅 Sending event reminders...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const eventsTomorrow = await prisma.events.findMany({
      where: {
        status: 'published',
        start_datetime: {
          gte: tomorrow,
          lt: nextDay
        }
      }
    });

    for (const event of eventsTomorrow) {
      await notificationService.sendEventReminder(event.id);
    }
    
    console.log(`✅ Sent reminders for ${eventsTomorrow.length} events`);
  });

  // Reset free entitlements - Annually on Jan 1st
  cron.schedule('0 0 1 1 *', async () => {
    console.log('🔄 Resetting annual free entitlements...');
    
    const updated = await prisma.memberships.updateMany({
      where: { status: 'active' },
      data: { free_events_used: 0 }
    });
    
    console.log(`✅ Reset entitlements for ${updated.count} members`);
  });

  // Clean up stale transactions - Every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    const staleTimeout = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    const stale = await prisma.transactions.updateMany({
      where: {
        status: { in: ['pending_stk_push', 'stk_push_sent'] },
        created_at: { lt: staleTimeout }
      },
      data: {
        status: 'failed',
        failure_reason: 'Transaction timeout'
      }
    });
    
    if (stale.count > 0) {
      console.log(`⏱️ Marked ${stale.count} stale transactions as failed`);
    }
  });

  console.log('✅ Cron jobs initialized');
}