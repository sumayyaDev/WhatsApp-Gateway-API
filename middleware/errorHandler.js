import { logError } from '../utils/logger.js';
import { CustomError } from '../utils/CustomError.js';
import { HTTP_STATUS } from '../constants/constants.js';

// === Global error handling ===
// TODO: Error handler middleware
// TODO: Async error wrapper
// TODO: 404 handler
// TODO: Custom error response

export const errorHandler = (err, req, res, next) => {
  // Log error
  logError('Error occurred', err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
  });

  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errorType: err.errorType,
      details: err.details,
      timestamp: err.timestamp,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'SyntaxError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Request validation failed',
      errorType: 'VALIDATION_ERROR',
      details: err.message,
    });
  }

  // Handle default errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'An internal server error occurred',
    errorType: 'DEFAULT',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

 // Async Error Handler
 // Wraps async route handlers to catch errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404
export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
};

export default errorHandler;
