// backend/src/modules/membership/membership.service.ts
import { prisma} from '../../../lib/prisma'
import { generateBarcodeData, generateMemberId } from '../../utils/barcode';

export class MembershipService {
  async getMembershipStatus(userId: string) {
    const membership = await prisma.memberships.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    if (!membership) {
      throw new Error('no_membership_found');
    }

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('user_not_found');
    }

    const isActive = membership.status === 'active' && 
                    new Date(membership.end_date) >= new Date();
    const daysRemaining = isActive 
      ? Math.ceil((new Date(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    const barcodeData = isActive 
      ? generateBarcodeData(userId, membership.end_date)
      : null;

    const memberId = generateMemberId(userId, membership.created_at);

    return {
      is_active: isActive,
      status: membership.status,
      digital_card: isActive ? {
        barcode_data: barcodeData,
        barcode_format: 'CODE128',
        member_since: membership.start_date.toISOString().split('T')[0],
        member_id: memberId
      } : null,
      current_period: {
        start_date: membership.start_date.toISOString().split('T')[0],
        end_date: membership.end_date.toISOString().split('T')[0],
        days_remaining: daysRemaining,
        is_expiring_soon: daysRemaining <= 7 && daysRemaining > 0
      },
      entitlements: {
        free_events_limit: membership.free_events_limit,
        free_events_used: membership.free_events_used,
        free_events_remaining: membership.free_events_limit - membership.free_events_used,
        last_free_event_used_at: membership.last_free_event_date
      },
      renewal_options: [
        {
          package_id: 'pkg_annual_standard',
          name: 'Annual Standard Membership',
          price: 2000.00,
          currency: 'KES',
          duration_days: 365,
          benefits: [
            'Event Discounts',
            '1 Free Event Per Year',
            'Digital Membership Card',
            'Member-Only Events Access'
          ]
        }
      ],
      membership_tier: membership.membership_tier,
      auto_renew_enabled: membership.auto_renew_enabled
    };
  }

  async getDigitalCard(userId: string) {
    const status = await this.getMembershipStatus(userId);
    
    if (!status.is_active || !status.digital_card) {
      throw new Error('no_active_membership');
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        profile_picture_url: true
      }
    });

    return {
      ...status.digital_card,
      member_name: `${user?.first_name} ${user?.last_name}`,
      profile_picture: user?.profile_picture_url,
      expiry_date: status.current_period.end_date,
      tier: status.membership_tier
    };
  }
}