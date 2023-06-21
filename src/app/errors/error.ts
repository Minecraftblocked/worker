type ErrorMap = { [key: string]: string | undefined };

class AppError extends Error {
  public errors: ErrorMap;
  public errorCode: number;

  constructor(errors: ErrorMap, errorCode = 400, message = '') {
    super(message);
    this.errors = errors;
    this.name = 'AppError';
    this.errorCode = errorCode;
  }

  get message(): string {
    return this.errors ? Object.values(this.errors).filter(Boolean).join(', ') : this.message;
  }
}

export default AppError;
