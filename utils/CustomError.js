import { HTTP_STATUS, ERROR_TYPES } from '../constants/constants.js';

// === Custom error classes === //
// TODO:  Base error class
// TODO: 400, 401, 409, 429, 503

export class CustomError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorType = ERROR_TYPES.DEFAULT,
    details = null
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.timestamp = new Date();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
      errorType: this.errorType,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Validation error
export class ValidationError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_TYPES.VALIDATION_ERROR,
      details
    );
    this.name = 'ValidationError';
  }
}

// Whatsapp error
export class WhatsAppError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_TYPES.WHATSAPP_ERROR,
      details
    );
    this.name = 'WhatsAppError';
  }
}

// Queue error
export class QueueError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.CONFLICT,
      ERROR_TYPES.QUEUE_ERROR,
      details
    );
    this.name = 'QueueError';
  }
}

// Authentication error
export class AuthenticationError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_TYPES.AUTHENTICATION_ERROR,
      details
    );
    this.name = 'AuthenticationError';
  }
}

// Rate limit error
export class RateLimitError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_TYPES.RATE_LIMIT_ERROR,
      details
    );
    this.name = 'RateLimitError';
  }
}

// Service unavailable error
export class ServiceUnavailableError extends CustomError {
  constructor(message, details = null) {
    super(
      message,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_TYPES.SERVICE_UNAVAILABLE,
      details
    );
    this.name = 'ServiceUnavailableError';
  }
}

// HTTP 429 status code addition
if (!HTTP_STATUS.TOO_MANY_REQUESTS) {
  HTTP_STATUS.TOO_MANY_REQUESTS = 429;
}
