/**
 * Job purpose: Crawl Mojang's Blockedservers API
 * and update with the app
 *
 * Workflow:
 * 1.
 *
 */
import { Job } from 'bull';
import axios from 'axios';
import failedMojangAPIError from '../errors/queue/failedMojangAPI';
import logger from '../../config/logger';
import {
  attachServerWithCrawl,
  insertOrUpdateServerByHash,
  updateManyUnblockedServers,
} from '../services/servers.service';
import { blockedServerFromHash as backUpServerFromHash } from '../services/providers.service';
import { delay } from '../util/delay';

const WAIT_TIME_MS = 500;

const onJob = async (job: Job) => {
  /**
   *! Step 1: Request Mojang API & transform into hashes
   */
  const response = await axios.get(`https://sessionserver.mojang.com/blockedservers?${Math.random() * 999999}`);
  if (response.status !== 200) throw new failedMojangAPIError();

  const crawledHashes = await response.data.split('\n').filter((hash: string) => hash.trim() !== '');
  logger.info(`Discovered ${crawledHashes.length} blocked server hashes from Mojang API`);

  job.progress(10); // update progress

  /**
   *! Step 2: Check against each Mojang Blocked Server Hash
   */
  for (let i = 0; i < crawledHashes.length; i++) {
    const hash = crawledHashes[i];

    logger.debug(`[${i}/${crawledHashes.length + 1}] ` + `Checking Mojang Hash ${hash}`);

    //* Step 3: Insert new blocked server OR update and log new blocked status of server
    await insertOrUpdateServerByHash(hash);
    job.progress(10 + (i / 2 / crawledHashes.length) * 50);

    //* Step 4: Check to see if the blocked server can be attached to a crawled server in DB
    const foundCrawl = await attachServerWithCrawl(hash);

    //* Step 5: If a crawl / minecraft server has not been found in DB, then check another service
    //! Backup check
    if (!foundCrawl) {
      await backUpServerFromHash(hash);
      await delay(WAIT_TIME_MS);
    }

    job.progress(10 + (i / crawledHashes.length) * 50);
  }

  //* Step 6: Update all servers in database that are not in the Mojang Hashes list
  await updateManyUnblockedServers(crawledHashes);

  logger.info('Completed Mojang API Crawl Job');
  job.progress(100);
};

export default onJob;
