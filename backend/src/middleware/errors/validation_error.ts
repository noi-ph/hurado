import express from 'express';
import { ValidationError } from 'yup';

type ValidationErrorNode = {
  errors: string[];
  inner?: ValidationErrorResponse[];
};

type ValidationErrorResponse = Record<string, ValidationErrorNode>;

function formatValidationError(error: ValidationError): ValidationErrorResponse {
  const response: ValidationErrorResponse = {};
  for (const inner of error.inner) {
    response[inner.path] = {
      errors: inner.errors,
    };
    if (inner.inner != null && inner.inner.length > 0) {
      response[inner.path].inner = inner.inner.map(formatValidationError);
    }
  }
  return response;
}

export function handleValidationError(
  err: Error,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (err instanceof ValidationError) {
    res.status(400).send(formatValidationError(err));
  } else {
    console.log('Nexting');
    next(err);
  }
}
