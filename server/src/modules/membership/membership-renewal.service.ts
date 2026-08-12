import { prisma} from '../../../lib/prisma'
import { PaymentsService } from '../payments/payments.service';

const paymentsService = new PaymentsService();

export class MembershipRenewalService {
  async initiateRenewal(userId: string, packageId: string, phoneNumber: string) {
    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    // Define pricing (can be fetched from database in future)
    const pricing: Record<string, { price: number; name: string; duration: number }> = {
      'pkg_annual_standard': {
        price: 2000.00,
        name: 'Annual Standard Membership',
        duration: 365
      }
    };
    
    const selectedPackage = pricing[packageId];
    if (!selectedPackage) {
      throw new Error('INVALID_PACKAGE');
    }
    
    // Check if user already has an active membership
    const currentMembership = await prisma.memberships.findFirst({
      where: {
        user_id: userId,
        status: 'active',
        end_date: { gte: new Date() }
      }
    });
    
    // Initiate payment
    const paymentResult = await paymentsService.initiateStkPush({
      phone_number: phoneNumber || user.phone_number,
      amount: selectedPackage.price,
      reference_type: 'membership',
      reference_id: currentMembership?.id || userId, // Use membership ID if exists
      description: `AZIKE ${selectedPackage.name}`,
      user_id: userId
    });
    
    return {
      ...paymentResult,
      package_details: {
        name: selectedPackage.name,
        price: selectedPackage.price,
        duration_days: selectedPackage.duration
      }
    };
  }
  
  async getRenewalOptions() {
    return [
      {
        package_id: 'pkg_annual_standard',
        name: 'Annual Standard Membership',
        price: 2000.00,
        currency: 'KES',
        duration_days: 365,
        benefits: [
          'Event Discounts (up to 70% off)',
          '1 Free Event Per Year',
          'Digital Membership Card',
          'Member-Only Events Access',
          'Community Voting Rights'
        ]
      }
    ];
  }
}