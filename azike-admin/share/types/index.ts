// shared/types/index.ts

// ============================================
// USER & AUTH TYPES
// ============================================
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoles extends User {
  roles: UserRole[];
}

export type UserRole = 'member' | 'admin' | 'super_admin' | 'event_staff';

export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
  fcm_token?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserWithRoles;
}

// ============================================
// MEMBERSHIP TYPES
// ============================================
export type MembershipStatus = 'active' | 'expired' | 'grace_period' | 'cancelled';
export type MembershipTier = 'standard' | 'premium';

export interface Membership {
  id: string;
  user_id: string;
  status: MembershipStatus;
  start_date: string;
  end_date: string;
  free_events_used: number;
  free_events_limit: number;
  membership_tier: MembershipTier;
  auto_renew_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipStatusResponse {
  is_active: boolean;
  status: MembershipStatus;
  digital_card: {
    barcode_data: string;
    barcode_format: 'CODE128';
    member_since: string;
    member_id: string;
  };
  current_period: {
    start_date: string;
    end_date: string;
    days_remaining: number;
    is_expiring_soon: boolean;
  };
  entitlements: {
    free_events_limit: number;
    free_events_used: number;
    free_events_remaining: number;
    last_free_event_used_at: string | null;
  };
  renewal_options: RenewalOption[];
}

export interface RenewalOption {
  package_id: string;
  name: string;
  price: number;
  currency: 'KES';
  duration_days: number;
  benefits: string[];
}

// ============================================
// EVENT TYPES
// ============================================
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventVisibility = 'public' | 'members_only' | 'hidden';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  location_coordinates: { lat: number; lng: number } | null;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string | null;
  banner_image_url: string | null;
  member_price: number;
  non_member_price: number;
  is_free_for_members: boolean;
  max_capacity: number | null;
  current_bookings: number;
  status: EventStatus;
  visibility: EventVisibility;
  created_at: string;
  updated_at: string;
}

export interface EventWithPricing extends Event {
  pricing: {
    member_price: number;
    non_member_price: number;
    your_price: number | null;
    is_eligible_for_free: boolean;
    discount_applied: boolean;
  };
  capacity: {
    max: number | null;
    current_bookings: number;
    is_available: boolean;
    spots_remaining: number | null;
  };
  user_booking_status: 'booked' | 'not_booked' | 'checked_in' | null;
}

// ============================================
// TICKET TYPES
// ============================================
export type TicketType = 'member_discounted' | 'non_member_standard' | 'free_entitlement' | 'admin_comp';

export interface Ticket {
  id: string;
  ticket_number: string;
  event_id: string;
  event_title?: string;
  user_id: string;
  ticket_type: TicketType;
  price_paid: number;
  qr_code_data: string;
  qr_code_image_url: string | null;
  is_checked_in: boolean;
  checked_in_at: string | null;
  purchased_at: string;
  is_cancelled: boolean;
}

export interface TicketPurchaseRequest {
  use_free_entitlement: boolean;
  phone_number: string;
  attendee_details?: {
    dietary_restrictions?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
}

// ============================================
// PAYMENT TYPES
// ============================================
export type TransactionStatus = 
  | 'pending_stk_push'
  | 'stk_push_sent'
  | 'mpesa_callback_received_success'
  | 'mpesa_callback_received_failed'
  | 'completed'
  | 'failed'
  | 'refunded';

export type TransactionType = 'membership_renewal' | 'event_ticket_purchase';

export interface Transaction {
  id: string;
  user_id: string;
  phone_number_used: string;
  amount: number;
  transaction_type: TransactionType;
  status: TransactionStatus;
  mpesa_receipt_number: string | null;
  reference_id: string;
  reference_type: string;
  created_at: string;
  completed_at: string | null;
}

export interface StkPushRequest {
  phone_number: string;
  amount: number;
  reference_type: 'membership' | 'event_ticket';
  reference_id: string;
  description: string;
}

export interface StkPushResponse {
  transaction_id: string;
  checkout_request_id: string;
  merchant_request_id: string;
  status: TransactionStatus;
  polling_url: string;
}

// ============================================
// CHECK-IN TYPES
// ============================================
export interface CheckInRequest {
  qr_data: string;
  event_id: string;
}

export interface CheckInResponse {
  ticket_id: string;
  ticket_number: string;
  attendee: {
    user_id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
    membership_status: MembershipStatus;
  };
  ticket_type: TicketType;
  checked_in_at: string;
  checked_in_by: string;
  event_title: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
  timestamp: string;
  request_id: string;
}

export interface ApiError {
  field: string | null;
  message: string;
}

export interface PaginatedResponse<T> {
  events: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
  };
}