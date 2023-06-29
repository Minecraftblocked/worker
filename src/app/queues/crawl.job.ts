import { Job } from 'bull';
import logger from '../../config/logger';
import onMinecraftServersOrg from './serverList/minecraftServersOrg.crawler';

const onJob = async (job: Job) => {
  try {
    switch (job.data.origin) {
      case 'minecraftservers.org': {
        await onMinecraftServersOrg(job);
        break;
      }
      case 'minecraft-server-list.com': {
        break;
      }
      default: {
        logger.error('Unexpected error occured on Crawler related to NO Origin');
      }
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export default onJob;
