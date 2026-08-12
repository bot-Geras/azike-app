import { prisma} from '../../../lib/prisma'
import { Prisma } from '../../../generated/prisma/client';
import { getAccessToken, generatePassword, getFormattedTimestamp, formatPhoneNumber, BASE_URL } from '../../config/mpesa';
import { generateIdempotencyKey, generateTransactionReference } from '../../utils/idempotency';

interface StkPushRequest {
  phone_number: string;
  amount: number;
  reference_type: 'membership' | 'event_ticket';
  reference_id: string;
  description: string;
  user_id: string;
}

interface StkPushResponse {
  transaction_id: string;
  checkout_request_id: string;
  merchant_request_id: string;
  status: string;
}

interface MpesaCallbackData {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
}

export class PaymentsService {
  async initiateStkPush(data: StkPushRequest): Promise<StkPushResponse> {
    const { phone_number, amount, reference_type, reference_id, description, user_id } = data;
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone_number);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Generate password and timestamp
    const timestamp = getFormattedTimestamp();
    const password = generatePassword();
    
    // Generate unique IDs
    const merchantRequestId = generateIdempotencyKey('MRQ');
    const checkoutRequestId = generateIdempotencyKey('CRQ');
    
    // Create transaction record FIRST (before API call)
    const transaction = await prisma.transactions.create({
      data: {
        user_id,
        phone_number_used: formattedPhone,
        amount,
        transaction_type: reference_type,
        reference_id,
        reference_type,
        merchant_request_id: merchantRequestId,
        checkout_request_id: checkoutRequestId,
        status: 'pending_stk_push',
        stk_push_request_payload: {
          phone_number: formattedPhone,
          amount,
          description,
          timestamp
        }
      }
    });
    
    // Prepare STK Push request
    const requestBody = {
      BusinessShortCode: parseInt(process.env.MPESA_BUSINESS_SHORTCODE!),
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // M-Pesa requires integer amount
      PartyA: parseInt(formattedPhone),
      PartyB: parseInt(process.env.MPESA_BUSINESS_SHORTCODE!),
      PhoneNumber: parseInt(formattedPhone),
      CallBackURL: process.env.MPESA_CALLBACK_URL!,
      AccountReference: generateTransactionReference(reference_type === 'membership' ? 'MEM' : 'EVT'),
      TransactionDesc: description.slice(0, 13) // M-Pesa limits to 13 chars
    };
    
    try {
      const response = await fetch(
        `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      const responseData = await response.json();

      if (!response.ok) {
        const error: any = new Error('STK_PUSH_REQUEST_FAILED');
        error.response = { data: responseData };
        throw error;
      }

      // Update transaction with response
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          status: 'stk_push_sent',
          stk_push_request_payload: {
            ...(transaction.stk_push_request_payload as any),
            response: responseData
          }
        }
      });
      
      console.log(`📱 STK Push sent to ${formattedPhone} for KES ${amount}`);
      
      return {
        transaction_id: transaction.id,
        checkout_request_id: checkoutRequestId,
        merchant_request_id: merchantRequestId,
        status: 'stk_push_sent'
      };
      
    } catch (error: any) {
      // Update transaction as failed
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          failure_reason: error.response?.data?.errorMessage || error.message
        }
      });
      
      console.error('❌ STK Push failed:', error.response?.data || error.message);
      throw new Error('STK_PUSH_FAILED');
    }
  }
  
  async processCallback(data: MpesaCallbackData): Promise<void> {
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = data;
    
    console.log(`📨 M-Pesa callback received for ${CheckoutRequestID}, ResultCode: ${ResultCode}`);
    
    // Find transaction
    const transaction = await prisma.transactions.findUnique({
      where: { checkout_request_id: CheckoutRequestID }
    });
    
    if (!transaction) {
      console.error(`❌ Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    
    // IDEMPOTENCY CHECK: Don't process if already completed
    if (transaction.status === 'completed') {
      console.log(`⏭️ Transaction ${transaction.id} already completed, skipping`);
      return;
    }
    
    // Extract metadata
    let mpesaReceiptNumber: string | null = null;
    let amount: number | null = null;
    let phoneNumber: string | null = null;
    
    if (CallbackMetadata) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = item.Value as string;
        } else if (item.Name === 'Amount') {
          amount = item.Value as number;
        } else if (item.Name === 'PhoneNumber') {
          phoneNumber = item.Value as string;
        }
      }
    }
    
    // Update transaction with callback data
    await prisma.transactions.update({
      where: { id: transaction.id },
      data: {
        mpesa_receipt_number: mpesaReceiptNumber,
        mpesa_callback_raw: data as unknown as Prisma.InputJsonValue,
        status: ResultCode === 0 ? 'mpesa_callback_received_success' : 'mpesa_callback_received_failed',
        failure_reason: ResultCode !== 0 ? ResultDesc : null
      }
    });
    
    // If payment successful, process business logic
    if (ResultCode === 0) {
      await this.processSuccessfulPayment(transaction.id);
    }
  }
  
  private async processSuccessfulPayment(transactionId: string): Promise<void> {
    // Use transaction lock to prevent race conditions
    await prisma.$transaction(async (tx: { transactions: { findUnique: (arg0: { where: { id: string; }; }) => any; update: (arg0: { where: { id: string; }; data: { status: string; completed_at: Date; }; }) => any; }; }) => {
      // Lock the transaction row
      const transaction = await tx.transactions.findUnique({
        where: { id: transactionId }
      });
      
      if (!transaction) return;
      
      // Double-check status to prevent double processing
      if (transaction.status === 'completed') {
        console.log(`⏭️ Transaction ${transactionId} already processed`);
        return;
      }
      
      console.log(`✅ Processing successful payment for ${transaction.transaction_type}`);
      
      // Process based on transaction type
      if (transaction.transaction_type === 'membership' && transaction.reference_id) {
        await this.processMembershipRenewal(tx, transaction);
      } else if (transaction.transaction_type === 'event_ticket' && transaction.reference_id) {
        await this.processEventTicketPurchase(tx, transaction);
      }
      
      // Mark transaction as completed
      await tx.transactions.update({
        where: { id: transactionId },
        data: {
          status: 'completed',
          completed_at: new Date()
        }
      });
      
      console.log(`🎉 Transaction ${transactionId} completed successfully`);
    });
  }
  
  private async processMembershipRenewal(tx: any, transaction: any): Promise<void> {
    const userId = transaction.user_id;
    
    // Find current membership
    const currentMembership = await tx.memberships.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    let membershipId: string;
    
    if (currentMembership) {
      // Extend existing membership
      const updatedMembership = await tx.memberships.update({
        where: { id: currentMembership.id },
        data: {
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          updated_at: new Date()
        }
      });
      membershipId = updatedMembership.id;
    } else {
      // Create new membership
      const newMembership = await tx.memberships.create({
        data: {
          user_id: userId,
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          free_events_used: 0,
          free_events_limit: 1,
          membership_tier: 'standard'
        }
      });
      membershipId = newMembership.id;
    }
    
    // Create renewal record
    await tx.membership_renewals.create({
      data: {
        membership_id: membershipId,
        user_id: userId,
        transaction_id: transaction.id,
        previous_end_date: currentMembership?.end_date || startDate,
        new_end_date: endDate,
        amount_paid: transaction.amount,
        receipt_number: transaction.mpesa_receipt_number
      }
    });
    
    console.log(`🎫 Membership renewed for user ${userId} until ${endDate.toISOString()}`);
  }
  
  private async processEventTicketPurchase(tx: any, transaction: any): Promise<void> {
    // This will be implemented in Sprint 3
    console.log(`🎟️ Event ticket purchase for transaction ${transaction.id} - Coming in Sprint 3`);
  }
  
  async getTransactionStatus(transactionId: string, userId: string): Promise<any> {
    const transaction = await prisma.transactions.findFirst({
      where: {
        id: transactionId,
        user_id: userId
      }
    });
    
    if (!transaction) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    
    const response: any = {
      transaction_id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      mpesa_receipt_number: transaction.mpesa_receipt_number,
      completed_at: transaction.completed_at,
      failure_reason: transaction.failure_reason,
      can_retry: transaction.status === 'failed' && transaction.retry_count < 3
    };
    
    // Add reference data if completed
    if (transaction.status === 'completed' && transaction.reference_type === 'membership') {
      const membership = await prisma.memberships.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });
      
      if (membership) {
        response.reference = {
          type: 'membership',
          new_expiry_date: membership.end_date
        };
      }
    }
    
    return response;
  }
  
  async getUserTransactions(userId: string, limit: number = 20): Promise<any[]> {
    const transactions = await prisma.transactions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });
    
    return transactions.map((t: { id: any; amount: any; transaction_type: any; status: any; mpesa_receipt_number: any; created_at: any; completed_at: any; }) => ({
      id: t.id,
      amount: t.amount,
      type: t.transaction_type,
      status: t.status,
      receipt: t.mpesa_receipt_number,
      created_at: t.created_at,
      completed_at: t.completed_at
    }));
  }
}