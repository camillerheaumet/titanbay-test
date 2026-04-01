import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'ERROR';

  console.error(`[${status}] ${code}: ${message}`);

  res.status(status).json({
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  });
}

export function createError(status: number, message: string, code: string = 'ERROR'): ApiError {
  const error: ApiError = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}
