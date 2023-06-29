import { Router } from 'express';
import CrawlController from '../controllers/crawl.controller';

export default Router().use(CrawlController);
