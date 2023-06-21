import Crawl from './crawl.model';
import ServerStatusChange from './serverStatusChange';

interface Server {
  id: number;

  mojangHash: string;

  isBlocked: boolean;
  crawl: Crawl | null;
  crawlId: number | null;

  blockedReason: string | null;
  ignoreReason: string | null;

  serverStatusChange: ServerStatusChange[];

  createdAt: Date;
  updatedAt: Date;
}

export default Server;
