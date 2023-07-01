import Bull, { Job } from 'bull';
import { environment as config } from './environment';
import onServerListCrawlerJob from '../app/queues/crawl.job';
import logger from './logger';
import onQuickUpdateJob from '../app/queues/quickUpdate.job';
import onSweeperJob from '../app/queues/sweeper.job';
import { Redis } from 'ioredis';

// Setup Redis configuration
type RedisConfigType = {
  host: string;
  port: number;
  username?: string;
  password?: string;
};
const redisConfig: RedisConfigType = {
  host: config.redis.host,
  port: config.redis.port,
};
if (config.production) {
  redisConfig.username = config.redis.username;
  redisConfig.password = config.redis.password;
}

export const redis = new Redis(redisConfig);

/**
 * Queue for Crawling the Mojang blocked servers API
 */
export const crawlMojangQueue = new Bull('crawl_mojang', {
  redis: redisConfig,
});

crawlMojangQueue.process(async (job: Job) => {
  if (job.data.quickUpdate && job.data.quickUpdate == true) {
    logger.info('');
    logger.info(`Starting OnQuickUpdate Queue Job: ${job.id}`);
    await onQuickUpdateJob(job);
  } else {
    logger.info('');
    logger.info(`Starting Sweeper Queue Job: ${job.id}`);
    await onSweeperJob(job);
  }
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
  redis: redisConfig,
});

crawlServerListQueue.process(async (job: Job) => {
  if (job.data.origin && job.data.startTime) {
    logger.info('');
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
