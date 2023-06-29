import { Job } from 'bull';
import axios from 'axios';
import FailedMojangAPIError from '../errors/queue/failedMojangAPI';
import logger from '../../config/logger';
import { updateManyUnblockedServers } from '../services/servers.service';

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

    logger.info(`Discovered ${blockedServerHashes.length} blocked server hashes from Mojang API`);

    // Update progress
    job.progress(10);

    // Update the status of servers that are unblocked
    await updateManyUnblockedServers(blockedServerHashes);

    // Mark job as complete
    job.progress(100);
  } catch (error) {
    logger.error(`Error in onJob: ${error}`);
  }
};

export default onJob;
