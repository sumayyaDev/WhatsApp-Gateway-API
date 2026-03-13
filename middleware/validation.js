import { ValidationError } from '../utils/CustomError.js';
import { PHONE_PATTERNS, MESSAGE_LIMITS } from '../constants/constants.js';

// === Request validation ===
// TODO: Phone number validation (international & Bangladesh formats)
// TODO: Message content validation
// TODO: Request body validation
// TODO: Validation middleware function

 // Validate phone number format
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    throw new ValidationError('Phone number is required and must be a string');
  }

  const cleanPhone = phone.replace(/\D/g, '');

  const isValidInternational = PHONE_PATTERNS.INTERNATIONAL.test(phone);
  const isValidBangladesh = PHONE_PATTERNS.BANGLADESH.test(phone);

  if (!isValidInternational && !isValidBangladesh) {
    throw new ValidationError(
      'Invalid phone number format. Please use Bangladesh format (e.g., +880XXXXXXXXXX, 880XXXXXXXXXX, or 0XXXXXXXXXX)'
    );
  }

  return cleanPhone;
};


export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    throw new ValidationError('Message is required and must be a string');
  }

  if (message.trim().length < MESSAGE_LIMITS.MIN_LENGTH) {
    throw new ValidationError('Message cannot be empty');
  }

  if (message.length > MESSAGE_LIMITS.MAX_LENGTH) {
    throw new ValidationError(
      `Message exceeds maximum length of ${MESSAGE_LIMITS.MAX_LENGTH} characters`
    );
  }

  return message.trim();
};

export const validateSendMessageRequest = (body) => {
  const { phone, message } = body;

  const validatedPhone = validatePhoneNumber(phone);
  const validatedMessage = validateMessage(message);

  return {
    phone: validatedPhone,
    message: validatedMessage,
  };
};

// Request validation middleware
export const validationMiddleware = (req, res, next) => {
  try {
    if (!req.body) {
      throw new ValidationError('Request body is required');
    }

    if (typeof req.body !== 'object') {
      throw new ValidationError('Request body must be valid JSON');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validatePhoneNumber,
  validateMessage,
  validateSendMessageRequest,
  validationMiddleware,
};
