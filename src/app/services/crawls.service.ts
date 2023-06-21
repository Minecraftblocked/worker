import * as dns from 'dns';
import { promisify } from 'util';
import { hashHostname } from '../util/hashDomain';
import { parseWildcardDomain } from '../util/wildcardDomain';
import logger from '../../config/logger';
import { wildcardBlackList } from '../../config/blacklist';
import { prisma } from '../../config/prisma';
import { default as Filter } from 'bad-words';

// libaries
const lookup = promisify(dns.lookup);
const filter = new Filter();

/**
 * Retrieve a Minecraft server crawled from other sites based on hash provided by Mojang
 */
export const findCrawlByHash = async (serverHash: string) => {
  const crawl = await prisma.crawl.findFirst({
    where: {
      OR: {
        hashedHost: serverHash,
        hashedHostWildcard: serverHash,
      },
    },
  });
  return crawl;
};

/**
 * Check whether crawl already exists based on hostname and port number
 */
export const doesCrawlExistByHostAndPort = async (serverHost: string, serverPort: number): Promise<boolean> => {
  const record = await prisma.crawl.findFirst({
    where: {
      serverHost,
      serverPort,
    },
  });
  return record != null;
};

export const addNewCrawl = async (
  origin: string,
  serverName: string,
  serverHost: string,
  serverPort: number,
): Promise<number> => {
  serverHost = serverHost.toLowerCase();
  const hashedHost = await hashHostname(serverHost);

  // Ping hostname for ip address and hash
  let ipAddress = null;
  try {
    const { address } = await lookup(serverHost);
    ipAddress = address;
  } catch (err) {
    logger.warn(`Error looking up IP address for ${serverHost}`, err);
  }

  // Check if the wildcard is in the blacklist and if not then hash
  let hashedHostWildcard = null;
  const hostWildcard = parseWildcardDomain(serverHost);
  if (hostWildcard && !wildcardBlackList.includes(hostWildcard)) {
    hashedHostWildcard = hostWildcard ? await hashHostname(hostWildcard) : null;
  }

  const censored = filter.isProfane(serverName) || filter.isProfane(serverHost);

  const crawl = await prisma.crawl.create({
    data: {
      serverListOrigin: origin,
      serverName,
      serverHost,
      serverIpAddress: ipAddress,
      serverHostWildcard: hostWildcard,
      serverPort,
      hashedHost,
      hashedHostWildcard,
      censored,
    },
  });

  return crawl.id;
};
