import logger from '../../config/logger';
import { prisma } from '../../config/prisma';
import CannotFindServerError from '../errors/server/CannotFindServer.error';
import { findCrawlByHash } from './crawls.service';

/**
 * Insert new blocked servers from Mojang into the database.
 * If already existing, update the existing database record.
 *
 * @param serverHash SHA-1 hash of the blocked server from the Mojang Blocked Servers API
 */
export const insertOrUpdateServerByHash = async (serverHash: string) => {
  const record = await prisma.server.findUnique({
    where: {
      mojangHash: serverHash,
    },
  });
  if (record == null) {
    logger.debug(`Insert new server blocked hash into DB: ${serverHash}`);
    await prisma.server.create({
      data: {
        mojangHash: serverHash,
        isBlocked: true,
      },
    });
  } else {
    // A blocked server already with that hash exists
    const server = await prisma.server.findUnique({
      where: {
        mojangHash: serverHash,
      },
    });
    if (server && !server.isBlocked) {
      logger.debug(`Changed status to Unblocked for Mojang hash: ${serverHash}`);
      // Update server to be blocked
      await prisma.server.update({
        where: {
          mojangHash: serverHash,
        },
        data: {
          isBlocked: true,
        },
      });
      // Add a log to show the cxhange
      await prisma.serverStatusChange.create({
        data: {
          newIsBlocked: true,
          serverId: server.id,
        },
      });
    }
  }
};

/**
 * Update the SHA-1 hash of a blocked server with the minecraft server's details
 * i.e. name and address
 *
 * @param serverHash SHA-1 hash of the blocked server from the Mojang Blocked Servers API
 *
 * @returns whether it could find a crawl within the database to associate with
 */
export const attachServerWithCrawl = async (serverHash: string): Promise<boolean> => {
  const server = await prisma.server.findUnique({
    where: {
      mojangHash: serverHash,
    },
  });
  if (!server) throw new CannotFindServerError(serverHash);

  if (!server.crawlId) {
    const crawl = await findCrawlByHash(serverHash);
    if (crawl) {
      // Update with crawlId
      await prisma.server.update({
        where: {
          id: server.id,
        },
        data: {
          crawlId: crawl.id,
        },
      });
      return true;
    }
  } else return true;

  return false;
};

export const updateServerWithCrawl = async (serverHash: string, crawlId: number) => {
  await prisma.server.update({
    where: {
      mojangHash: serverHash,
    },
    data: {
      crawlId,
    },
  });
};

export const updateManyUnblockedServers = async (hashes: string[], isBlocked: boolean) => {
  // Retrieve all servers from the database that are still marked as blocked,
  // but are not included in the list provided by the Mojang API.
  const serverIds = await prisma.server
    .findMany({
      where: {
        mojangHash: {
          notIn: hashes,
        },
        isBlocked: false,
      },
      select: {
        id: true, // select only ids
      },
    })
    .then((servers) => servers.map((server) => server.id));

  logger.debug(`Updated the Status to Unblocked for ${serverIds.length} servers`);

  // Now, update all those servers to be unblocked
  await prisma.server.updateMany({
    where: {
      mojangHash: {
        notIn: hashes,
      },
    },
    data: {
      isBlocked,
    },
  });

  // Now store all the unblocked statuses in database
  await serverIds.map(
    async (serverId) =>
      await prisma.serverStatusChange.create({
        data: {
          serverId,
          newIsBlocked: false,
        },
      }),
  );
};
