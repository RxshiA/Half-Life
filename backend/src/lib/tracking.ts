import crypto from 'crypto';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const NUMBER_LENGTH = 8;

export function generateTrackingNumber(): string {
  const bytes = crypto.randomBytes(NUMBER_LENGTH);
  let suffix = '';
  for (const byte of bytes) {
    suffix += CHARSET[byte % CHARSET.length];
  }
  return `CS-${suffix}`;
}
