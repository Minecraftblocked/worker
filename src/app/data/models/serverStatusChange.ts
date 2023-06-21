import Server from './server.model';

interface ServerStatusChange {
  id: number;

  newIsBlocked: boolean;

  server: Server;

  serverId: number;

  createdAt: Date;
}

export default ServerStatusChange;
