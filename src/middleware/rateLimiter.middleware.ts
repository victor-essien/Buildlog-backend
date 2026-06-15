import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';


export const authLimiter = rateLimit({
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS! ),
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS!),
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      code: 'AUTH_RATE_LIMIT_ERROR',
      message:
        'Too many authentication attempts. Please try again',
    });
  },
});
