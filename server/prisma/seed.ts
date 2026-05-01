// backend/prisma/seed.ts
import {prisma} from '../lib/prisma'

import bcrypt from 'bcrypt';



async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.users.upsert({
    where: { email: 'admin@azike.com' },
    update: {},
    create: {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@azike.com',
      phone_number: '254700000000',
      password_hash: adminPassword,
      is_email_verified: true,
      is_phone_verified: true,
      user_roles: {
        create: [
          { role: 'admin' },
          { role: 'super_admin' }
        ]
      }
    }
  });

  // Create active member
  const memberPassword = await bcrypt.hash('Member@123', 10);
  const activeMember = await prisma.users.upsert({
    where: { email: 'sarah.mwangi@example.com' },
    update: {},
    create: {
      first_name: 'Sarah',
      last_name: 'Mwangi',
      email: 'sarah.mwangi@example.com',
      phone_number: '254712345678',
      password_hash: memberPassword,
      is_email_verified: true,
      is_phone_verified: true,
      user_roles: {
        create: { role: 'member' }
      }
    }
  });

  // Create membership for Sarah
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const existingActiveMembership = await prisma.memberships.findFirst({ where: { user_id: activeMember.id } });
  await prisma.memberships.upsert({
    where: { id: existingActiveMembership?.id || '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      user_id: activeMember.id,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      free_events_used: 0,
      free_events_limit: 1,
      membership_tier: 'standard'
    }
  });

  // Create expired member
  const expiredPassword = await bcrypt.hash('Expired@123', 10);
  const expiredMember = await prisma.users.upsert({
    where: { email: 'john.expired@example.com' },
    update: {},
    create: {
      first_name: 'John',
      last_name: 'Expired',
      email: 'john.expired@example.com',
      phone_number: '254723456789',
      password_hash: expiredPassword,
      is_email_verified: true,
      is_phone_verified: true,
      user_roles: {
        create: { role: 'member' }
      }
    }
  });

  // Create expired membership for John
  const expiredStart = new Date();
  expiredStart.setFullYear(expiredStart.getFullYear() - 1);
  const expiredEnd = new Date();
  expiredEnd.setDate(expiredEnd.getDate() - 1);

  const existingExpiredMembership = await prisma.memberships.findFirst({ where: { user_id: expiredMember.id } });
  await prisma.memberships.upsert({
    where: { id: existingExpiredMembership?.id || '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      user_id: expiredMember.id,
      status: 'expired',
      start_date: expiredStart,
      end_date: expiredEnd,
      free_events_used: 1,
      free_events_limit: 1,
      membership_tier: 'standard'
    }
  });

  // Create sample events
  const futureDate1 = new Date();
  futureDate1.setMonth(futureDate1.getMonth() + 2);
  
  const futureDate2 = new Date();
  futureDate2.setMonth(futureDate2.getMonth() + 3);

  await prisma.events.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'AZIKE Beach Cleanup 2026',
        description: 'Join us for our annual coastal conservation drive at Diani Beach.',
        location: 'Diani Beach, Kwale',
        start_datetime: futureDate1,
        end_datetime: new Date(futureDate1.getTime() + 5 * 60 * 60 * 1000),
        member_price: 500.00,
        non_member_price: 1500.00,
        is_free_for_members: false,
        max_capacity: 200,
        current_bookings: 45,
        status: 'published',
        visibility: 'public',
        created_by: admin.id
      },
      {
        title: 'Members Only Gala Dinner',
        description: 'Exclusive networking dinner for AZIKE members at Sarova Whitesands.',
        location: 'Sarova Whitesands, Mombasa',
        start_datetime: futureDate2,
        end_datetime: new Date(futureDate2.getTime() + 5 * 60 * 60 * 1000),
        member_price: 2500.00,
        non_member_price: 2500.00,
        is_free_for_members: false,
        max_capacity: 100,
        current_bookings: 23,
        status: 'published',
        visibility: 'members_only',
        created_by: admin.id
      }
    ]
  });

  console.log('✅ Seeding complete!');
  console.log(`
📋 Test Accounts:
─────────────────────────────────────────────────
Admin:     admin@azike.com / Admin@123
Member:    sarah.mwangi@example.com / Member@123
Expired:   john.expired@example.com / Expired@123
─────────────────────────────────────────────────
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });