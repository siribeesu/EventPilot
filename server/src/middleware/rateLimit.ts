import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API routes (150 requests per 15 mins)
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Strict rate limiter for AI generation and AI Assistant endpoints (25 requests per minute)
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI request limit reached. Please wait a minute before requesting further plan adjustments.',
  },
});

// Auth endpoints rate limiter (15 attempts per 15 mins)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again in 15 minutes',
  },
});
