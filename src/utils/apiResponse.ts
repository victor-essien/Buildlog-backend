import {Response} from 'express'

export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
  error?: any;
  timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    data?: any, // T
    meta?: any,
    success: boolean = true
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}


/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number = 200,
  message: string = 'Success',
  data?: T,
  meta?: any
): Response => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, data, meta, true));
};

export const sendSuccessRefresh = <T>(
  res: Response,
  statusCode: number = 200,
  message: string = 'Success',
  accessToken?: T,
  meta?: any
): Response => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, accessToken, meta, true));
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  statusCode: number = 500,
  message: string = 'An error occurred',
  error?: {
    code?: string;
    details?: any;
  }
): Response => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString(),
  });
};

export const sendCreated = <T>(
  res: Response,
  message: string = 'Resource created successfully',
  data?: T
): Response => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};
