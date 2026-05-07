// backend/src/modules/events/events.service.ts
import { prisma} from '../../../lib/prisma'
import { Prisma } from '../../../generated/prisma/client';

export class EventsService {
  async getEvents(options: {
    status?: string;
    limit?: number;
    page?: number;
    userId?: string;
  }) {
    const { status = 'upcoming', limit = 20, page = 1, userId } = options;
  const offset = (page - 1) * limit;


    const where: Prisma.eventsWhereInput = {
    status: 'published',
    ...(status === 'upcoming' ? { start_datetime: { gte: new Date() } } : {}),
    ...(status === 'past' ? { end_datetime: { lt: new Date() } } : {})
  };

    const [events, totalCount] = await Promise.all([
      prisma.events.findMany({
        where,
        orderBy: { start_datetime: 'asc' },
        take: limit,
        skip: offset,
        include: {
          tickets: userId ? {
            where: { user_id: userId, is_cancelled: false }
          } : false
        }
      }),
      prisma.events.count({ where })
    ]);

    // Get user membership for pricing
    let membership: any = null;
    if (userId) {
      membership = await prisma.memberships.findFirst({
        where: {
          user_id: userId,
          status: 'active',
          end_date: { gte: new Date() }
        }
      });
    }

    const eventsWithPricing = events.map((event: any) => {
      const isMember = membership !== null;
      const userTicket = event.tickets?.[0];
      
      const memberPrice = Number(event.member_price);
      const nonMemberPrice = Number(event.non_member_price);
      
      let yourPrice: number | null = null;
      let isEligibleForFree = false;
      let discountApplied = false;

      if (isMember) {
        if (event.is_free_for_members) {
          yourPrice = 0;
          isEligibleForFree = membership.free_events_used < membership.free_events_limit;
        } else {
          yourPrice = memberPrice;
          discountApplied = memberPrice < nonMemberPrice;
        }
      } else {
        yourPrice = nonMemberPrice;
      }

      return {
        event_id: event.id,
        title: event.title,
        description: event.description?.substring(0, 200) + '...',
        location: event.location,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        banner_image_url: event.banner_image_url,
        pricing: {
          member_price: memberPrice,
          non_member_price: nonMemberPrice,
          your_price: yourPrice,
          is_eligible_for_free: isEligibleForFree,
          discount_applied: discountApplied
        },
        capacity: {
          max: event.max_capacity,
          current_bookings: event.current_bookings,
          is_available: !event.max_capacity || event.current_bookings < event.max_capacity,
          spots_remaining: event.max_capacity ? event.max_capacity - event.current_bookings : null
        },
        is_members_only: event.visibility === 'members_only',
        registration_deadline: event.registration_deadline,
        user_booking_status: userTicket ? 
          (userTicket.is_checked_in ? 'checked_in' : 'booked') : null
      };
    });

    return {
      events: eventsWithPricing,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalCount / limit),
        total_events: totalCount,
        limit
      }
    };
  }

  async getEventById(eventId: string, userId?: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        tickets: userId ? {
          where: { user_id: userId, is_cancelled: false }
        } : false
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    let membership: any = null;
    if (userId) {
      membership = await prisma.memberships.findFirst({
        where: {
          user_id: userId,
          status: 'active',
          end_date: { gte: new Date() }
        }
      });
    }

    const isMember = membership !== null;
    const userTicket = event.tickets?.[0];
    const memberPrice = Number(event.member_price);
    const nonMemberPrice = Number(event.non_member_price);
    
    let yourPrice: number | null = null;
    let isEligibleForFree = false;
    let discountApplied = false;

    if (isMember) {
      if (event.is_free_for_members) {
        yourPrice = 0;
        isEligibleForFree = membership.free_events_used < membership.free_events_limit;
      } else {
        yourPrice = memberPrice;
        discountApplied = memberPrice < nonMemberPrice;
      }
    } else {
      yourPrice = nonMemberPrice;
    }

    return {
      event_id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      location_coordinates: (event as any).location_coordinates,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      registration_deadline: event.registration_deadline,
      banner_image_url: event.banner_image_url,
      organizer: {
        name: 'AZIKE Events Committee',
        contact_email: 'events@azike.com'
      },
      pricing: {
        member_price: memberPrice,
        non_member_price: nonMemberPrice,
        currency: 'KES',
        your_price: yourPrice,
        is_eligible_for_free: isEligibleForFree,
        free_entitlements_remaining: membership ? 
          membership.free_events_limit - membership.free_events_used : 0
      },
      capacity: {
        max: event.max_capacity,
        current_bookings: event.current_bookings,
        is_available: !event.max_capacity || event.current_bookings < event.max_capacity,
        spots_remaining: event.max_capacity ? event.max_capacity - event.current_bookings : null
      },
      user_booking_status: userTicket ? 
        (userTicket.is_checked_in ? 'checked_in' : 'booked') : null,
      is_members_only: event.visibility === 'members_only',
      created_at: event.created_at
    };
  }
}