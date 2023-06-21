import AppError from '../error';

class UnexpectedDatabaseError extends AppError {
  constructor(message = '') {
    super({ mysql: 'An unexpected database error occurred' }, 500, message);
    this.name = 'UnexpectedDatabaseError';
  }
}

export default UnexpectedDatabaseError;
