import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Global Limiter: Protects against general spam and DDoS.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 0 : 1000, // limit each IP to 1000 requests per windowMs. Disable for tests.
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes', type: 'RateLimitError' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth Limiter: Stricter limits to prevent brute-force attacks on login/register.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 0 : 20, // Limit each IP to 20 login/register requests per windowMs
  message: { success: false, error: 'Too many authentication attempts, please try again after 15 minutes', type: 'RateLimitError' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ping Limiter: Prevents a single user/IP from spamming ping requests
export const pingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.NODE_ENV === 'test' ? 0 : 5, // Limit each IP to 5 ping creations per minute
  message: { success: false, error: 'You are sending pings too quickly. Please wait a minute.', type: 'RateLimitError' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Limiter: Strict per-user/IP limit for AI endpoints
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.NODE_ENV === 'test' ? 0 : 5, // Max 5 AI requests per minute
  message: { success: false, error: 'AI rate limit exceeded. Please try again later.', type: 'RateLimitError' },
  standardHeaders: true,
  legacyHeaders: false,
});
