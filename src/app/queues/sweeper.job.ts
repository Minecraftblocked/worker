import { Job } from 'bull';
import axios from 'axios';
import FailedMojangAPIError from '../errors/queue/failedMojangAPI';
import logger from '../../config/logger';
import { findServerByID, updateManyUnblockedServers } from '../services/servers.service';
import { Server, ServerStatusChange } from '@prisma/client';
import { default as Filter } from 'bad-words';
import { createTwitterMessage, postTweet } from '../services/twitter.service';
import { getTimeDifference } from '../util/dateUtils';

/**
 * This job is responsible for fetching the latest blocked server hashes
 * from Mojang's API, and identifying servers that have been unblocked.
 *
 * It should be scheduled to run every 15 minutes.
 */
const onJob = async (job: Job) => {
  try {
    // Fetch the latest blocked server hashes from Mojang API with cache-busting parameter
    const response = await axios.get(
      `https://sessionserver.mojang.com/blockedservers?cacheBust=${Math.random() * 999999}`,
    );

    // Check if the response is successful
    if (response.status !== 200) {
      throw new FailedMojangAPIError();
    }

    // Extract and clean the server hashes from the response data
    const blockedServerHashes = response.data.split('\n').filter((hash: string) => hash.trim() !== '');

    // Update progress
    job.progress(10);

    // Update the status of servers that are unblocked
    const serverIds = await updateManyUnblockedServers(blockedServerHashes);

    // Notify twitter of unblocked servers
    for (const serverId of serverIds) {
      const server: Server | null = await findServerByID(serverId);
      // Server is within DB
      if (server) {
        // @ts-expect-error typescript is wrong for some reason
        const crawl: Crawl = server.crawl;
        // @ts-expect-error typescript is wrong for some reason
        const statusChanges: ServerStatusChange[] = server.ServerStatusChange;

        // Rename incase of censorship
        let hostName = crawl.serverHost;
        if (hostName && crawl.censored) {
          const filter = new Filter({ placeHolder: '*' });
          hostName = filter.clean(hostName);
        }

        // Find when lastTimeBlocked
        const lastBlocked = statusChanges
          .filter((change) => change.newIsBlocked)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        let messageLines: string[] = [];
        if (lastBlocked && statusChanges.length > 1) {
          const timeBlocked = getTimeDifference(lastBlocked.createdAt);
          messageLines = [
            'Server has been unblocked by Mojang again ✅',
            '',
            `Hash: '${server.mojangHash}' is now unblocked.`,
            `Server is known as ${hostName || 'Unknown'}`,
            `Blocked for ${timeBlocked}`,
            '',
            'Stay tuned for further updates.',
          ];
        } else {
          const timeBlocked = getTimeDifference(server.createdAt);
          messageLines = [
            'Server has been unblocked by Mojang ✅',
            '',
            `Hash: '${server.mojangHash}' is now unblocked.`,
            `Server is known as ${hostName || 'Unknown'}`,
            `Blocked for ${timeBlocked}`,
            '',
            'Stay tuned for further updates.',
          ];
        }

        const message = createTwitterMessage(messageLines);
        await postTweet(message);
      }
    }

    // Mark job as complete
    job.progress(100);
  } catch (error) {
    logger.error(`Error in onJob: ${error}`);
  }
};

export default onJob;
