// backend/src/utils/idempotency.ts
import crypto from 'crypto';

export function generateIdempotencyKey(prefix: string): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
}

export function generateTransactionReference(prefix: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  return `AZI${prefix}${year}${month}${day}${random}`;
}