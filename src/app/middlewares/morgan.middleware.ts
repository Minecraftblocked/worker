import morgan from 'morgan';
import logger from '../../config/logger';
import { environment as config } from '../../config/environment';

const stream = {
  write: (message: string) => logger.http(message),
};

const skip = () => {
  const env = config.production ? 'production' : 'development';
  return env !== 'development';
};

// Build the morgan middleware
const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', { stream, skip });

export default morganMiddleware;
