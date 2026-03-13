import express from 'express';
import {
  sendMessageController,
  getQueueStatusController,
  getStatusController,
  initializeWhatsAppController,
} from '../controllers/messageController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validationMiddleware } from '../middleware/validation.js';

// === API routes === //

const router = express.Router();

// POST /api/send-message - Send message via WhatsApp
router.post(
  '/send-message',
  validationMiddleware,
  asyncHandler(sendMessageController)
);

// GET /api/status - Get WhatsApp and Queue status
router.get('/status', asyncHandler(getStatusController));

// GET /api/queue/status - Get queue statistics
router.get('/queue/status', asyncHandler(getQueueStatusController));

// POST /api/initialize - Initialize WhatsApp
router.post('/initialize', asyncHandler(initializeWhatsAppController));

export default router;