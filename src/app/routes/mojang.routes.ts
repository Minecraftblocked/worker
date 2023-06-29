import { Router } from 'express';
import QuickUpdateController from '../controllers/quickUpdate.controller';
import SweeperController from '../controllers/sweeper.controller';

export default Router().use(QuickUpdateController).use(SweeperController);
