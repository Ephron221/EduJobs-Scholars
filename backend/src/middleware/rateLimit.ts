import { Request, Response, NextFunction } from 'express';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = `${req.ip}:${req.originalUrl}:${req.body?.email || ''}`;
    const now = Date.now();
    const bucket = buckets.get(identifier);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(identifier, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    bucket.count += 1;
    next();
  };
};
