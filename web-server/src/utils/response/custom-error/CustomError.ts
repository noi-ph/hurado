import { ErrorType, ErrorArray, ErrorResponse } from './types';

export class CustomError extends Error {
  private httpStatusCode: number;
  private errorType: ErrorType;
  private errorRaw: any;
  private errors: ErrorArray | null;

  constructor(
    httpStatusCode: number,
    errorType: ErrorType,
    message: string,
    errorRaw: any = null,
    errors: ErrorArray | null = new ErrorArray(),
  ) {
    super(message);

    this.name = this.constructor.name;

    this.httpStatusCode = httpStatusCode;
    this.errorType = errorType;
    this.errorRaw = errorRaw;
    this.errors = errors;
  }

  get HttpStatusCode() {
    return this.httpStatusCode;
  }

  get JSON(): ErrorResponse {
    return {
      errorType: this.errorType,
      errorMessage: this.message,
      errorRaw: this.errorRaw,
      errors: this.errors,
      stack: this.stack,
    };
  }
}
