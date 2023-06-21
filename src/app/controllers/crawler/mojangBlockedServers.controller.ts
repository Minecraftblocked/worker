import { secretMiddleware } from './../../middlewares/secret.middleware';
import { NextFunction, Request, Response, Router } from 'express';
import { crawlMojangQueue } from '../../../config/queue';

const router = Router();

/**
 * Intiates a worker to speak to the Mojang API to get current blocked mineecraft servers (by SHA-1 hashes).
 * Attempts to relate the servers to the crawls of minecraft servers stored within the database.
 */
router.post('/crawler/mojang/', secretMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await crawlMojangQueue.add({
      startTime: Date.now(),
    });

    return res.status(200).json({ jobId: job.id });
  } catch (error) {
    return next(error);
  }
});

export default router;
