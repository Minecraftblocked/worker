import { Queue } from 'bull';
import { Request, Response, Router } from 'express';
import { crawlMojangQueue, crawlServerListQueue } from '../../config/queue';

const router = Router();

/**
 * Quick health status of worker
 */
router.get('/status', async (req: Request, res: Response) => {
  return res.status(200).json({
    uptime: process.uptime(),
    message: 'OK',
    date: new Date(),
  });
});

/**
 * Quick status of the Queues for Mojang API and Crawling Server Lists
 */
router.get('/status/queue', async (req: Request, res: Response) => {
  const queueDetails = [];
  const queues: Queue[] = [crawlServerListQueue, crawlMojangQueue];

  for (const queueIndex in queues) {
    const queue = queues[queueIndex];
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    const delayed = await queue.getDelayed();

    const waitingCount = waiting.length;
    const activeCount = active.length;
    const completedCount = completed.length;
    const failedCount = failed.length;
    const delayedCount = delayed.length;

    queueDetails.push({
      name: queueIndex === '0' ? 'Crawl ServerList' : 'Mojang API',
      waiting: waiting.map((job) => ({ id: job.id, progress: job.progress() })),
      active: active.map((job) => ({ id: job.id, progress: job.progress() })),
      delayed: delayed.map((job) => ({ id: job.id, progress: job.progress() })),
      counts: {
        waiting: waitingCount,
        active: activeCount,
        completed: completedCount,
        failed: failedCount,
        delayed: delayedCount,
        paused: await queue.getPausedCount(),
      },
    });
  }

  return res.status(200).json({ queueDetails });
});

export default router;
