/**
 * Simple in-memory rate limiter for edge runtime
 * Uses Maps to track request counts per IP/identifier
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on deployment/restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  max: number;
  /**
   * Time window in seconds
   */
  windowSec: number;
  /**
   * Custom identifier (defaults to IP address)
   */
  identifier?: string;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request is within rate limit
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and headers info
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): RateLimitResult {
  const { max, windowSec, identifier } = config;

  // Get identifier (custom or IP address)
  const id = identifier || getClientIp(request);
  const key = `ratelimit:${id}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry if doesn't exist or expired
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      limit: max,
      remaining: max - 1,
      reset: entry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: max,
    remaining: max - entry.count,
    reset: entry.resetAt,
  };
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: Request): string {
  // Try Cloudflare header first
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Try X-Forwarded-For
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    return ips[0].trim();
  }

  // Try X-Real-IP
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Fallback
  return 'unknown';
}

/**
 * Preset rate limit configurations
 */
export const RateLimits = {
  // Authentication endpoints: 10 requests per 15 minutes
  AUTH: { max: 10, windowSec: 15 * 60 },

  // Download endpoints: 5 requests per hour
  DOWNLOAD: { max: 5, windowSec: 60 * 60 },

  // API endpoints: 60 requests per minute
  API: { max: 60, windowSec: 60 },

  // Webhook endpoints: 100 requests per minute
  WEBHOOK: { max: 100, windowSec: 60 },

  // Payment creation: 3 requests per 5 minutes
  PAYMENT: { max: 3, windowSec: 5 * 60 },
} as const;
