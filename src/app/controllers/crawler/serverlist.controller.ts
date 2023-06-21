import { secretMiddleware } from './../../middlewares/secret.middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { crawlServerListQueue } from '../../../config/queue';

const router = Router();

/**
 * Triggers a worker to retrieve currently blocked Minecraft servers from the Mojang API using SHA-1 hashes.
 * Attempts to associate these servers with previously crawled Minecraft servers stored in the database.
 */
router.post(
  '/crawler/serverList/:origin',
  secretMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { origin } = req.params;
    if (!origin) return res.status(404).json({ message: 'Origin is required in params' });

    try {
      const job = await crawlServerListQueue.add({
        startTime: Date.now(),
        origin: origin.toLowerCase(),
      });

      return res.status(200).json({ jobId: job.id });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
