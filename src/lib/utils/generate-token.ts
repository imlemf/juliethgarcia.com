import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a unique download token
 * Uses CUID2 for cryptographically secure unique IDs
 */
export function generateDownloadToken(): string {
  return createId();
}
