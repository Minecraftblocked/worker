import AppError from '../error';

class failedMojangAPIError extends AppError {
  constructor() {
    super({ api: 'Request to mojang blocked servers api failed' }, 500);
    this.name = 'FailedBlockServersError';
  }
}

export default failedMojangAPIError;
