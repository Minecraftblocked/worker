import { Router, Request, Response } from 'express';
import healthController from '../controllers/health.controller';

const routes = Router();

routes.get('/', async (req: Request, res: Response) => {
  return res.status(200).send('Hello. You found me :)');
});

export default routes.use(healthController);
