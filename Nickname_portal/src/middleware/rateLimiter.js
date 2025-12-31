/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and DDoS
 */

// For now, using a simple in-memory store
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map();

/**
 * Simple rate limiter implementation
 * @param {Object} options - Rate limit options
 * @param {Number} options.windowMs - Time window in milliseconds
 * @param {Number} options.max - Maximum number of requests per window
 * @param {String} options.message - Error message to return
 * @param {Boolean} options.skipSuccessfulRequests - Skip counting successful requests
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 16 * 60 * 1000, // 1 minute default
    max = 100, // 100 requests per window default
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }
    }

    let record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    // Increment count
    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    // Check if limit exceeded
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000), // seconds
      });
    }

    // Skip counting successful requests if option is set
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function (data) {
        if (res.statusCode < 400) {
          record.count = Math.max(0, record.count - 1);
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
};

/**
 * Strict rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
exports.authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true,
});

/**
 * General API rate limiter
 * Standard rate limiting for all endpoints
 */
exports.apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Strict rate limiter for sensitive operations
 * For endpoints like password reset, registration, etc.
 */
exports.strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  message: 'Too many attempts. Please try again after 1 hour.',
});

/**
 * Custom rate limiter factory
 * Allows creating custom rate limiters for specific routes
 */
exports.createRateLimiter = createRateLimiter;
