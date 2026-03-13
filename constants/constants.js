// TODO: HTTP status codes
// TODO: API messages
// TODO: Connection states (DISCONNECTED, CONNECTING, AUTHENTICATING, WAITING_FOR_QR, CONNECTED, ERROR, RECONNECTING)
// TODO: Queue States
// TODO: Error types
// TODO: Phone number patterns
// TODO: Message limits
// TODO: Log events
// TODO: Timeouts

// HTTP Status Codes & Messages
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Request processed successfully',
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_QUEUED: 'Message queued for sending',
  VALIDATION_ERROR: 'Request validation failed',
  INTERNAL_ERROR: 'An internal server error occurred',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_REQUEST: 'Duplicate request detected',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_MESSAGE: 'Invalid message format',
  WHATSAPP_NOT_CONNECTED: 'WhatsApp is not connected. Please authenticate first.',
  WHATSAPP_AUTHENTICATING: 'WhatsApp is authenticating. Please scan QR code.',
  QUEUE_FULL: 'Message queue is full. Please try again later.',
};

// Connection States
export const CONNECTION_STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting...',
  AUTHENTICATING: 'authenticating...',
  WAITING_FOR_QR: 'waiting_for_qr...',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting...',
};

// Queue States
export const QUEUE_STATE = {
  PENDING: 'pending...',
  PROCESSING: 'processing...',
  SENT: 'sent',
  FAILED: 'failed',
  RETRYING: 'retrying...',
};

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DEFAULT: 'DEFAULT',
  WHATSAPP_ERROR: 'WHATSAPP_ERROR',
  QUEUE_ERROR: 'QUEUE_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

// Phone Number Validation
export const PHONE_PATTERNS = {
  // International format: +1234567890 or 1234567890
  INTERNATIONAL: /^\+?[\d]{10,15}$/,
  // Bangladesh format: +880XXXXXXXXXX or 880XXXXXXXXXX or 0XXXXXXXXXX (11 digits with leading 0)
  BANGLADESH: /^(\+880|880|0)?[\d]{10,11}$/,
};

// Message Limits
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 4096,
  MIN_LENGTH: 1,
};

// Log Events
export const LOG_EVENTS = {
  SERVER_START: 'SERVER_START',
  SERVER_STOP: 'SERVER_STOP',
  WHATSAPP_CONNECTED: 'WHATSAPP_CONNECTED',
  WHATSAPP_DISCONNECTED: 'WHATSAPP_DISCONNECTED',
  WHATSAPP_ERROR: 'WHATSAPP_ERROR',
  QR_GENERATED: 'QR_GENERATED',
  MESSAGE_QUEUED: 'MESSAGE_QUEUED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_FAILED: 'MESSAGE_FAILED',
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  API_REQUEST: 'API_REQUEST',
  API_ERROR: 'API_ERROR',
};

// Default Timeouts
export const TIMEOUTS = {
  QR_TIMEOUT: 90000, // 90 seconds
  RECONNECT_TIMEOUT: 5000, // 5 seconds
  MESSAGE_TIMEOUT: 10000, // 10 seconds
};
