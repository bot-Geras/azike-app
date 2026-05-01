import crypto from 'crypto';

export const generateBarcodeData = (userId: string, expiryDate: Date): string => {
  const memberSince = new Date().toISOString().split('T')[0];
  const expiry = expiryDate.toISOString().split('T')[0];
  
  // Format: AZIKE:MEM:{userId}:EXP:{expiryDate}:SINCE:{memberSince}
  const barcodeData = `AZIKE:MEM:${userId}:EXP:${expiry}:SINCE:${memberSince}`;
  
  // Add checksum for validation
  const checksum = crypto
    .createHash('md5')
    .update(barcodeData + process.env.QR_SECRET)
    .digest('hex')
    .substring(0, 8);
  
  return `${barcodeData}:CHK:${checksum}`;
};

export const generateMemberId = (userId: string, createdAt: Date): string => {
  const year = createdAt.getFullYear();
  const hash = crypto
    .createHash('md5')
    .update(userId)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  
  return `AZI-${year}-${hash}`;
};