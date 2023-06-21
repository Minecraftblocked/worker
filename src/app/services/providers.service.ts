import axios from 'axios';
import { parseServerListAddress } from '../util/parseServerListAddress';
import { addNewCrawl } from './crawls.service';
import logger from '../../config/logger';
import { updateServerWithCrawl } from './servers.service';

const getBlockedServerFromHash = async (serverHash: string): Promise<string | null> => {
  const response = await axios.get(`https://ismyserverblocked.com/lookup/${serverHash}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return (await response.data.hostname) || null;
};

export const blockedServerFromHash = async (serverHash: string): Promise<void> => {
  const hostname = await getBlockedServerFromHash(serverHash);
  logger.debug(`Found hostname: ${hostname}`);

  if (hostname !== null) {
    const addressAndPort = await parseServerListAddress(hostname);
    const insertCrawlId = await addNewCrawl(
      'ismyserverblocked.com',
      'unknown',
      addressAndPort.address,
      addressAndPort.port,
    );
    if (insertCrawlId !== null) {
      await updateServerWithCrawl(serverHash, insertCrawlId);
    }
  }
};
