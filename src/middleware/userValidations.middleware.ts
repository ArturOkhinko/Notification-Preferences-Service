import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ApiError, FieldError } from '../exceptions/api-error';

const toFieldErrors = (error: ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.map(String).join('.'),
    message: issue.message,
  }));

const buildValidationError = (error: ZodError): ApiError =>
  ApiError.badRequest('Validation failed', toFieldErrors(error));

export const validateParams =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(buildValidationError(result.error));
    }
    next();
  };

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(buildValidationError(result.error));
    }
    req.body = result.data;
    next();
  };
