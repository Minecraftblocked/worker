import logger from '../../../config/logger';
import axios from 'axios';
import cheerio from 'cheerio';
import { delay } from '../../util/delay';
import { parseServerListAddress } from '../../util/parseServerListAddress';
import { addNewCrawl, doesCrawlExistByHostAndPort } from '../../services/crawls.service';
import { Job } from 'bull';

const SERVER_LIST_URL = 'https://minecraftservers.org/index/';
const START_PAGE = 1;
const WAIT_TIME_MS = 3000;
const CRAWL_LIMIT = 2000;

const onCrawler = async (job: Job) => {
  /*
   * Step 1: Loop and request each MinecraftServers.org page
   */
  for (let loop = START_PAGE; loop < CRAWL_LIMIT; loop++) {
    try {
      logger.info(`Running Minecraftservers.org crawl for page [${loop}/${CRAWL_LIMIT}]`);

      const response = await axios.get(`${SERVER_LIST_URL}${loop}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      //! Check for End of Pages or Unexpected Error
      if (response.status === 404) {
        loop = CRAWL_LIMIT;
        logger.info('Minecraftservers.org crawl reached end');
        return; // Complete the job when 404 is reached
      }
      if (response.status !== 200) {
        logger.warn(`Minecraftservers.org crawl: an error occured: code ${response.status}`);
        throw new Error('Unexpected status code');
      }

      //* Step 2: Load HTML page from request into cheerio
      //*         find the server name and address in the html page
      const $ = cheerio.load(response.data);

      //* Step 3: Insert the crawled server into the database,
      //*         if not already stored
      const crawledServers = await extractServers($);

      await processServers(crawledServers);

      // Progress job
      job.progress(Math.round(loop / CRAWL_LIMIT) * 100);

      // Wait unti next Page (to avoid throttling)
      await delay(WAIT_TIME_MS);
    } catch (err) {
      logger.warn(err);
    }
  }
};

/**
 * Extract the minecraft servers information from minecraftservers.org by page
 */
const extractServers = async ($: cheerio.Root): Promise<{ serverAddress: string; serverName: string }[]> => {
  const crawledServers: { serverAddress: string; serverName: string }[] = [];

  // Find .serverlist tables in servers page
  const tables = $('table.serverlist');
  await tables.each(async (tableIndex, table) => {
    // Find table body
    const tbody = $(table).find('tbody');
    if (tbody.length === 0) return;

    // Loop through each table row
    await tbody.find('tr').each(async (rowIndex, row) => {
      try {
        // Find server name for each row
        const serverNameElement = $(row).find('.server-name a');
        if (serverNameElement.length === 0) return;
        /* eslint-disable no-control-regex */
        const serverName = serverNameElement
          .clone() // Clone the element to preserve the original
          .children() // Get the children elements (including the <span> element)
          .remove() // Remove the children elements (including the <span> element)
          .end() // Go back to the original element
          .text()
          .trim();

        // Find server address for each row
        const serverAddressElement = $(row).find('.server-ip p');
        if (serverAddressElement.length === 0) return;
        const serverAddress = serverAddressElement
          .clone() // Clone the element to preserve the original
          .children() // Get the children elements (including the <span> element)
          .remove() // Remove the children elements (including the <span> element)
          .end() // Go back to the original element
          .text()
          .trim();

        // Push each crawled server from page (20 servers)
        crawledServers.push({ serverAddress, serverName });
      } catch (err) {
        if (err instanceof Error) {
          logger.warn(err.message);
        } else {
          logger.warn('An error occurred, but it was not an instance of Error');
        }
      }
    });
  });
  return crawledServers;
};

/**
 * Attempt to input any new minecraft server crawl into the database
 */
const processServers = async (servers: { serverAddress: string; serverName: string }[]): Promise<void> => {
  for (const server of servers) {
    const addressAndPort = await parseServerListAddress(server.serverAddress);

    const exists = await doesCrawlExistByHostAndPort(addressAndPort.address, addressAndPort.port);
    // Also check if it exists by servername

    if (!exists) {
      logger.debug(`Adding server: ${addressAndPort.address}`);
      await addNewCrawl('minecraftservers.org', server.serverName, addressAndPort.address, addressAndPort.port);
    }
  }
};

export default onCrawler;
