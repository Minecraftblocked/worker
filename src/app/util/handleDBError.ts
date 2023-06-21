import DatabaseConnectionError from '../errors/mysql/databaseConnection.error';
import UnexpectedDatabaseError from '../errors/mysql/unexpectedDatabase.error';

export const handleDatabaseError = (err: Error): never => {
  if (!(err instanceof Error)) throw err;
  if (err.message === 'ECONNREFUSED') {
    throw new DatabaseConnectionError(err.message);
  } else {
    throw new UnexpectedDatabaseError(err.message);
  }
};
