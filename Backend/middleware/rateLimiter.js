// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 10 * 1000,     // 10 seconds
  max: 5,                  // 5 requests per 10 seconds per user
  message: { message: "Too many requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
