// backend/src/config/mpesa.ts
import { redis } from './redis';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

const config: MpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortcode: process.env.MPESA_BUSINESS_SHORTCODE!,
  callbackUrl: process.env.MPESA_CALLBACK_URL!,
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
};

const BASE_URL = config.environment === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CACHE_KEY = 'mpesa:access_token';
const CACHE_TTL = 3500; // 58 minutes (token expires after 60 mins)

export async function getAccessToken(): Promise<string> {
  // Check cache first
  const cachedToken = await redis.get(CACHE_KEY);
  if (cachedToken) {
    return cachedToken;
  }

  // Fetch new token
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  
  try {
    const response = await fetch(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`M-Pesa auth failed with status: ${response.status}`);
    }

    const data = (await response.json()) as { access_token: string };
    const accessToken = data.access_token;
    
    // Cache token
    await redis.setex(CACHE_KEY, CACHE_TTL, accessToken);
    
    console.log('✅ M-Pesa access token obtained');
    return accessToken;
  } catch (error) {
    console.error('❌ Failed to get M-Pesa access token:', error);
    throw new Error('MPESA_AUTH_FAILED');
  }
}

export function generatePassword(): string {
  const timestamp = getFormattedTimestamp();
  const password = Buffer.from(
    `${config.shortcode}${config.passkey}${timestamp}`
  ).toString('base64');
  
  return password;
}

export function getFormattedTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}

export { config as mpesaConfig, BASE_URL };