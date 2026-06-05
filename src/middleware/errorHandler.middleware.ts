import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../exceptions/api-error';
import { logger } from '../infra/logger';

const isProd = process.env.NODE_ENV === 'production';

const PG_UNIQUE_VIOLATION = '23505'; // (unique violation Postgres) → 409 Conflict
const PG_FOREIGN_KEY_VIOLATION = '23503'; // (FK violation) → 400
const JSON_PARSE_FAILED = 'entity.parse.failed'; // (битый JSON из express.json) → 400

interface UnknownError extends Error {
  status?: number;
  code?: string;
  type?: string;
}

const buildPgDuplicateError = (): ApiError =>
  ApiError.conflict('Duplicate value violates unique constraint');

const buildPgForeignKeyError = (): ApiError =>
  ApiError.badRequest('Referenced entity does not exist');

const buildJsonParseError = (): ApiError =>
  ApiError.badRequest('Invalid JSON body');

const toApiError = (err: UnknownError): ApiError | null => {
  if (err instanceof ApiError) return err;
  if (err.code === PG_UNIQUE_VIOLATION) return buildPgDuplicateError();
  if (err.code === PG_FOREIGN_KEY_VIOLATION) return buildPgForeignKeyError();
  if (err.type === JSON_PARSE_FAILED) return buildJsonParseError();
  return null;
};

const buildLogContext = (req: Request, err: UnknownError) => ({
  method: req.method,
  url: req.originalUrl,
  err: {
    type: err.name,
    code: err.code,
    message: err.message,
    status: err.status,
    stack: err.stack,
  },
});

const buildOperationalBody = (apiErr: ApiError) => ({
  isSuccess: false,
  message: apiErr.message,
  errors: apiErr.errors,
});

const buildProgrammaticBody = (err: UnknownError) => ({
  isSuccess: false,
  message: isProd ? 'Internal Server Error' : err.message || 'Unknown error',
  errors: [],
  ...(isProd ? {} : { stack: err.stack }),
});

const logError = (
  req: Request,
  err: UnknownError,
  apiErr: ApiError | null,
): void => {
  const context = buildLogContext(req, err);
  if (apiErr) {
    logger.warn('operational_error', context);
    return;
  }
  logger.error('unhandled_exception', context);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(buildOperationalBody(ApiError.notFound()));
};

export const errorHandler = (
  err: UnknownError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const apiErr = toApiError(err);
  logError(req, err, apiErr);

  const status = apiErr ? apiErr.status : 500;
  const body = apiErr
    ? buildOperationalBody(apiErr)
    : buildProgrammaticBody(err);

  res.status(status).json(body);
};
