import { Router } from 'express';
import mojangController from '../controllers/crawler/mojangBlockedServers.controller';
import serverListController from '../controllers/crawler/serverlist.controller';

export default Router().use(mojangController).use(serverListController);
