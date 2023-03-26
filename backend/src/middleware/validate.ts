import { Request, NextFunction, Response } from 'express';
import HttpError from 'http-errors';
import { Schema, ValidateOptions, ValidationError } from 'yup';

const DefaultOptions: ValidateOptions = {
  strict: true,
  abortEarly: false,
  stripUnknown: true,
  recursive: true,
};

export function validateJSON<T>(schema: Schema<T>, options: ValidateOptions = DefaultOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const data = req.body;
    try {
      await schema.validate(data, options);
      next();
    } catch (error) {
      next(error);
    }
  };
}
