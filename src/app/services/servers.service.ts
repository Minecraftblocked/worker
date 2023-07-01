import { Server } from '@prisma/client';
import logger from '../../config/logger';
import { prisma } from '../../config/prisma';
import CannotFindServerError from '../errors/server/CannotFindServer.error';
import { findCrawlByHash } from './crawls.service';

/**
 * Insert new blocked servers from Mojang into the database.
 * If already existing, update the existing database record if the server is unblocked.
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
    // Found server and is unblocked, meaning status update
    if (server && server.isBlocked === false) {
      logger.debug(`Changed status to Blocked for Mojang hash: ${serverHash}`);
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

export const updateManyUnblockedServers = async (hashes: string[]): Promise<number[]> => {
  try {
    // Retrieve IDs of servers that are still marked as blocked, but are not in the Mojang's blocked hashes list.
    const serverIds = await prisma.server
      .findMany({
        where: {
          mojangHash: {
            notIn: hashes,
          },
          isBlocked: true,
        },
        select: {
          id: true,
        },
      })
      .then((servers) => servers.map((server) => server.id));

    logger.info(`Identified ${serverIds.length} servers for status update to unblocked`);
    logger.info(`Server Ids: ${serverIds}`);

    // Update the status of identified servers to unblocked
    await prisma.server.updateMany({
      where: {
        id: {
          in: serverIds,
        },
      },
      data: {
        isBlocked: false,
      },
    });

    // Log server status changes in the database
    for (const serverId of serverIds) {
      await prisma.serverStatusChange.create({
        data: {
          serverId,
          newIsBlocked: false,
        },
      });
    }

    // Return the server IDs that were updated
    return serverIds;
  } catch (error) {
    logger.error(`Error in updateManyUnblockedServers: ${error}`);
    // In case of error, return an empty array
    return [];
  }
};

export const findServerByHash = async (hash: string): Promise<Server | null> => {
  const result = await prisma.server.findUnique({
    where: {
      mojangHash: hash,
    },
    include: {
      ServerStatusChange: true,
      crawl: true,
    },
  });
  return result;
};

export const findServerByID = async (id: number): Promise<Server | null> => {
  const result = await prisma.server.findUnique({
    where: {
      id,
    },
    include: {
      ServerStatusChange: true,
      crawl: true,
    },
  });
  return result;
};
