/**
 * Simple in-memory rate limiter for API routes
 * 
 * Note: This is a basic implementation suitable for single-server deployments.
 * For production with multiple servers, use Redis or a distributed rate limiter.
 * 
 * Requirements: Security consideration for journal endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  
  // Don't prevent process from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Time in milliseconds until the rate limit resets */
  resetIn: number;
}

/**
 * Default rate limit configuration: 10 requests per minute
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Check if a request is allowed under the rate limit
 * 
 * @param identifier - Unique identifier for the client (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): RateLimitResult {
  startCleanup();
  
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  // Increment count and allow request
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Create rate limit headers for the response
 * 
 * @param result - Rate limit check result
 * @param config - Rate limit configuration
 * @returns Headers object with rate limit information
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Record<string, string> {
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if available, otherwise falls back to a default
 * 
 * @param request - The incoming request
 * @param userId - Optional user ID to use as identifier
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if available (more accurate for authenticated users)
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to get IP from headers (common in proxied environments)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }
  
  // Fallback to a generic identifier (not ideal but prevents errors)
  return 'ip:unknown';
}
