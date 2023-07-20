import ApiError from '@src/util/errors/api-error';
import { NextFunction, Request, Response } from 'express';

export interface HttpError extends Error {
  status?: number;
}

export function apiErrorValidator(
  error: HttpError,
  _: Partial<Request>,
  res: Response,
  __: NextFunction
): void {
  const errorCode = error.status || 500;

  res
    .status(errorCode)
    .send(ApiError.format({ code: errorCode, message: error.message }));
}
