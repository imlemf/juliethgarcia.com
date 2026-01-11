import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a unique purchase code (12 characters, alphanumeric, uppercase)
 * Format: ABC123XYZ456
 */
export function generatePurchaseCode(): string {
  const id = createId();
  // Take first 12 chars and convert to uppercase
  return id.substring(0, 12).toUpperCase();
}
