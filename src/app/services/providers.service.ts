import axios from 'axios';
import { parseServerListAddress } from '../util/parseServerListAddress';
import { addNewCrawl } from './crawls.service';
import logger from '../../config/logger';
import { updateServerWithCrawl } from './servers.service';
import { completeServerNameFromHostname } from './chatGPT.service';

/**
 * Fetches the blocked server information from the provided hash.
 *
 * @param serverHash The server hash to lookup
 * @return The hostname or null if not found
 */
const fetchBlockedServerInfo = async (serverHash: string): Promise<string | null> => {
  try {
    const response = await axios.get(`https://ismyserverblocked.com/lookup/${serverHash}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data.hostname || null;
  } catch (error) {
    logger.error(`Error fetching blocked server info: ${error}`);
    return null;
  }
};

/**
 * Queries ismyserverblocked.com for the provided server hash, and updates
 * the server with crawl information if the server is blocked.
 *
 * @param serverHash The server hash to process
 */
export const processBlockedServerHash = async (serverHash: string): Promise<void> => {
  try {
    const hostname = await fetchBlockedServerInfo(serverHash);
    logger.debug(`Found hostname: ${hostname}`);

    if (hostname) {
      const { address, port } = await parseServerListAddress(hostname);

      // Use ChatGPT to find a name
      const chatGPTName = await completeServerNameFromHostname(hostname);
      if (chatGPTName !== 'unknown') logger.info(`chatgpt responded with name [${chatGPTName}] for ${hostname}`);

      const crawlId = await addNewCrawl('ismyserverblocked.com', chatGPTName, address, port);

      if (crawlId) {
        await updateServerWithCrawl(serverHash, crawlId);
      }
    }
  } catch (error) {
    logger.error(`Error in processBlockedServerHash: ${error}`);
  }
};
