import { Request, Response, NextFunction } from 'express';
import { environment as config } from '../../config/environment';

/**
 * Middleware to secure crawler routes by requiring
 * a password query parameter in POST requests,
 * enabling them to function akin to cronjobs.
 */
export const secretMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    const { password } = req.query;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    const passwordAsString = String(password);
    if (passwordAsString !== config.worker.secret) {
      console.debug(`Secret is: ${config.worker.secret}`);
      return res.status(400).json({ error: 'Password is required' });
    }
  }
  next();
};
