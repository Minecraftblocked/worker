import * as yup from 'yup';
import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/error';

/**
 * Custom middleware for handling errors across the application
 */
export async function handleError(err: Error, req: Request, res: Response, next: NextFunction) {
  if (!err) return next();

  // Check core error type
  if (err instanceof AppError) {
    return res.status(err.errorCode).json({
      errors: err.errors,
      message: err.message,
      code: err.errorCode,
    });
  }
  if (err instanceof yup.ValidationError) {
    // Transform errors from yup
    const errors: { [key: string]: string } = {};
    err.inner.forEach((validationError: yup.ValidationError) => {
      if (validationError.path) {
        errors[validationError.path as string] = validationError.message;
      }
    });
    // Return with yup validation errors
    return res.status(400).json({
      errors: err.errors,
      message: 'The inputted data is invalid',
      code: 400,
    });
  }

  return res.status(500).json({
    message: 'An unexpected error has occured',
    code: 500,
    errors: {
      unknown: err.message,
    },
  });
}
