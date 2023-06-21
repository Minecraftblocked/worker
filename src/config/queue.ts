import Bull, { Job } from 'bull';
import { environment as config } from './environment';
import onCrawlMojangAPIJob from '../app/queues/mojangBlockedServers.job';
import onServerListCrawlerJob from '../app/queues/crawler.job';
import logger from './logger';

/**
 * Queue for Crawling the Mojang blocked servers API
 */
export const crawlMojangQueue = new Bull('crawl_mojang', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    username: config.redis.username,
    password: config.redis.password,
  },
});

crawlMojangQueue.process(async (job: Job) => {
  logger.info(`Starting Mojang Queue Job: ${job.id}`);
  await onCrawlMojangAPIJob(job);
});

crawlMojangQueue.on('error', (error) => {
  logger.error(`Error occured on Mojang Queue job: ${error.message}`);
});

crawlMojangQueue.on('completed', (job) => {
  logger.info(`Mojang Blocked Servers Job ${job.id} completed successfully`);
});

/**
 * Queue for crawling different minecraft server lists
 */
export const crawlServerListQueue = new Bull('crawl_server_list', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    username: config.redis.username,
    password: config.redis.password,
  },
});

crawlServerListQueue.process(async (job: Job) => {
  if (job.data.origin && job.data.startTime) {
    logger.info(`Starting ServerList Job: ${job.id} ${job.data.origin}`);
    await onServerListCrawlerJob(job);
  } else {
    logger.error('An unexpected error has occured. Crawl for ServerList does not contain origin');
  }
});

crawlServerListQueue.on('completed', (job) => {
  logger.info(`ServerList Job ${job.id} completed successfully`);
});

crawlServerListQueue.on('error', (error) => {
  logger.error(`Error occured on ServerList Queue: ${error.message}`);
});
