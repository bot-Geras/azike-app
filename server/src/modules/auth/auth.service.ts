import bcrypt from 'bcrypt';
import { prisma} from '../../../lib/prisma'
import { generateTokens, TokenPayload, verifyRefreshToken } from '../../utils/jwt';

export class AuthService {
  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone_number: data.phone_number }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === data.email ? 'email' : 'phone_number';
      throw new Error(`${field}_already_exists`);
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        password_hash,
        user_roles: {
          create: { role: 'member' }
        }
      },
      include: {
        user_roles: true
      }
    });

    // Create initial membership record (expired status)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.memberships.create({
      data: {
        user_id: user.id,
        status: 'expired',
        start_date: yesterday,
        end_date: yesterday,
        free_events_used: 0,
        free_events_limit: 1,
        membership_tier: 'standard'
      }
    });

    return {
      user_id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      requires_phone_verification: true
    };
  }

  async login(identifier: string, password: string, fcm_token?: string) {
    // Find user by email or phone
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone_number: identifier }
        ]
      },
      include: {
        user_roles: true,
        memberships: {
          where: {
            OR: [
              { status: 'active' },
              { status: 'grace_period' }
            ]
          },
          orderBy: { end_date: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      throw new Error('invalid_credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('invalid_credentials');
    }

    // Update FCM token if provided
    if (fcm_token) {
      await prisma.users.update({
        where: { id: user.id },
        data: { fcm_token }
      });
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.user_roles.map((r: { role: any; }) => r.role)
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    // Check membership status
    const activeMembership = user.memberships[0];
    const isMemberActive = activeMembership?.status === 'active' && 
                          new Date(activeMembership.end_date) >= new Date();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      user: {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        profile_picture_url: user.profile_picture_url,
        is_member_active: isMemberActive,
        roles: user.user_roles.map((r: { role: any; }) => r.role)
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        include: { user_roles: true }
      });

      // Check if user exists
      if (!user) {
        throw new Error('user_not_found');
      }

      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles: user.user_roles.map((r: { role: any; }) => r.role)
      };

      const { accessToken } = generateTokens(payload);

      return {
        access_token: accessToken,
        expires_in: 3600
      };
    } catch (error) {
      throw new Error('invalid_refresh_token');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_roles: true,
        memberships: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      throw new Error('user_not_found');
    }

    const membership = user.memberships[0];
    const isActive = membership?.status === 'active' && 
                    new Date(membership.end_date) >= new Date();

    return {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      profile_picture_url: user.profile_picture_url,
      is_phone_verified: user.is_phone_verified,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
      roles: user.user_roles.map((r: { role: any; }) => r.role),
      membership: membership ? {
        is_active: isActive,
        status: membership.status,
        start_date: membership.start_date,
        end_date: membership.end_date,
        days_until_expiry: isActive 
          ? Math.ceil((new Date(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
        free_events_used: membership.free_events_used,
        free_events_remaining: membership.free_events_limit - membership.free_events_used,
        membership_tier: membership.membership_tier
      } : null
    };
  }
}