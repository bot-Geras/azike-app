// shared/constants/index.ts

export const APP_CONSTANTS = {
  APP_NAME: 'AZIKE Community',
  API_VERSION: 'v1',
  SUPPORT_EMAIL: 'support@azike.com',
  SUPPORT_PHONE: '+254700000000',
} as const;

export const MEMBERSHIP = {
  STANDARD_PRICE: 2000,
  STANDARD_DURATION_DAYS: 365,
  FREE_EVENTS_PER_YEAR: 1,
  GRACE_PERIOD_DAYS: 7,
} as const;

export const PAYMENT = {
  CURRENCY: 'KES',
  MPESA_SHORTCODE: '174379',
  TRANSACTION_TIMEOUT_SECONDS: 60,
  POLLING_INTERVAL_MS: 3000,
} as const;

export const VALIDATION = {
  PHONE_REGEX: /^254[17]\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
} as const;