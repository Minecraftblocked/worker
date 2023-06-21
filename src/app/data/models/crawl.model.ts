import Server from './server.model';

interface Crawl {
  id: number;

  serverListOrigin: string;
  serverName: string | null;
  serverHost: string | null;
  serverIpAddress: string | null;
  serverHostWildcard: string | null;
  serverPort: number | null;

  hashedHost: string;
  hashedHostWildcard: string | null;

  censored: boolean;

  server: Server[];

  createdAt: Date;
  updatedAt: Date;
}

export default Crawl;
