import AppError from '../error';

class DatabaseConnectionError extends AppError {
  constructor(message = '') {
    super({ mysql: 'Could not connect to the database' }, 500, message);
    this.name = 'DatabaseConnectionError';
  }
}

export default DatabaseConnectionError;
