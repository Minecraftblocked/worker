import AppError from '../error';

class CannotFindServerError extends AppError {
  constructor(serverHash: string) {
    super({ server: `Cannot find server ${serverHash} in database` }, 500);
    this.name = 'CannotFindServerError';
  }
}

export default CannotFindServerError;
