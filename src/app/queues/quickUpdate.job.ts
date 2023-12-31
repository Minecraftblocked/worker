import axios from 'axios';
import { Job } from 'bull';
import FailedMojangAPIError from '../errors/queue/failedMojangAPI';
import logger from '../../config/logger';
import { attachServerWithCrawl, findServerByHash, insertOrUpdateServerByHash } from '../services/servers.service';
import { processBlockedServerHash } from '../services/providers.service';
import { redis } from '../../config/redis';
import { delay } from '../util/delay';
import { createTwitterMessage, postTweet } from '../services/twitter.service';
import { Crawl, Server } from '@prisma/client';
import { default as Filter } from 'bad-words';

/**
 * This job retrieves blocked server hashes from Mojang's API
 * and identifies any new hashes compared to the previously cached ones.
 *
 * The intent is that this job is run every 5 minutes, quickly with a cache.
 */
const onJob = async (job: Job) => {
  const startTime = job.data.startTime;

  // Get the current known blocked hashes by cache
  const cachedHashes = await redis.get('mojang_blocked_hashes');

  // Request all the blocked server hashes from Mojang
  const response = await axios.get(`https://sessionserver.mojang.com/blockedservers?${Math.random() * 999999}`);
  if (response.status !== 200) throw new FailedMojangAPIError();
  const responseHashes = await response.data.split('\n').filter((hash: string) => hash.trim() !== '');

  // Hashes are cached
  let hashesToInvestigate: string[] = [];
  if (cachedHashes) {
    const jsonCachedHashes = JSON.parse(cachedHashes);

    // Identify the hashes that are new compared to the cached ones
    const newBlockedHashes = responseHashes.filter((hash: string) => !jsonCachedHashes.includes(hash));
    hashesToInvestigate = newBlockedHashes;
  } else {
    logger.info('First time caching hashes');
    hashesToInvestigate = responseHashes;
  }

  // Loop through new hashes
  for (const newHash of hashesToInvestigate) {
    // [1]: Insert new blocked server OR update and log new blocked status of server
    await insertOrUpdateServerByHash(newHash);

    // [2]: Check to see if the blocked server can be attached to a crawled server in DB
    const foundCrawl = await attachServerWithCrawl(newHash);

    // [3]: If a crawl / minecraft server has not been found in DB, then check another service
    if (!foundCrawl) {
      await processBlockedServerHash(newHash);
      await delay(500);
    }

    // [4]: Notify twitter client of newly blocked server
    const server: Server | null = await findServerByHash(newHash);
    if (server && server.crawlId) {
      // @ts-expect-error typescript is wrong for some reason
      const crawl: Crawl = server.crawl;

      let hostName = crawl.serverHost;
      if (hostName && crawl.censored) {
        const filter = new Filter({ placeHolder: '*' });
        hostName = filter.clean(hostName);
      }

      const message = createTwitterMessage([
        'Server blocked by Mojang ❌',
        '',
        `Server is known as ${hostName}`,
        '',
        'Stay tuned for updates.',
      ]);
      await postTweet(message);
    } else {
      const message = createTwitterMessage([
        'Server blocked by Mojang ❌',
        '',
        `Hash '${newHash}' has been blocked.`,
        '',
        'Stay tuned for updates.',
      ]);
      await postTweet(message);
    }
  }

  // Set hashes blocked into Redis cache (expiry of 1 hour)
  await redis.set('mojang_blocked_hashes', JSON.stringify(responseHashes), 'EX', 3600);

  // Compute job time taken
  const endTime = Date.now();
  const timeTakenInSeconds = (endTime - startTime) / 1000;

  logger.info(`✅ Job QuickUpdate[${job.id}] time taken: ${timeTakenInSeconds} seconds`);
};

export default onJob;
