import { whatsAppService } from '../services/whatsappService.js';
import { queueManager } from '../utils/queueManager.js';
import { validateSendMessageRequest } from '../middleware/validation.js';
import { logInfo, logError } from '../utils/logger.js';
import { HTTP_STATUS, API_MESSAGES, LOG_EVENTS } from '../constants/constants.js';
import {
  WhatsAppError,
  ValidationError,
  CustomError,
} from '../utils/CustomError.js';

// ===== API controller =====
// TODO: Message sending with queuing
// TODO: Queue statistics endpoint
// TODO: WhatsApp and queue status
// TODO: WhatsApp initialization
// TODO: Async queue processing function

// Handles incoming message send requests
export const sendMessageController = async (req, res, next) => {
  try {
    const { phone, message } = req.body;

    logInfo(LOG_EVENTS.API_REQUEST, {
      endpoint: '/api/send-message',
      phone,
      messageLength: message?.length,
    });

    const validatedData = validateSendMessageRequest({ phone, message });

    // Check if WhatsApp is connected
    if (!whatsAppService.isReady()) {
      const state = whatsAppService.getState();

      logError('WhatsApp not connected', new Error('Connection unavailable'), {
        state: state.state,
        phone,
      });

      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        status: 'error',
        message: API_MESSAGES.WHATSAPP_NOT_CONNECTED,
        currentState: state.state,
        details:
          state.state === 'waiting_for_qr'
            ? 'Please scan QR code first'
            : undefined,
      });
    }

    // Add message to queue
    const queueItem = queueManager.addToQueue(
      validatedData.phone,
      validatedData.message,
      {
        source: 'api',
        timestamp: new Date(),
      }
    );

    logInfo(LOG_EVENTS.MESSAGE_QUEUED, {
      queueId: queueItem.id,
      phone: validatedData.phone,
    });

    // Start processing queue
    processQueueAsync();

    return res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: API_MESSAGES.MESSAGE_QUEUED,
      queueId: queueItem.id,
      details: {
        phone: validatedData.phone,
        messageLength: validatedData.message.length,
        position: queueManager.queue.length,
        state: queueItem.state,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

 // Processes queued messages in the background
let processingLock = false;

async function processQueueAsync() {
  if (processingLock) {
    return; 
  }

  processingLock = true;

  try {
    await queueManager.processQueue((phone, message) =>
      whatsAppService.sendMessage(phone, message)
    );
  } catch (error) {
    logError('Queue processing error', error);
  } finally {
    processingLock = false;

    // Continue processing if there are more items
    if (queueManager.queue.length > 0) {
      setTimeout(processQueueAsync, 1000);
    }
  }
}

 // Returns current queue status and statistics
export const getQueueStatusController = async (req, res, next) => {
  try {
    const status = queueManager.getStatus();

    logInfo('Queue status requested', {
      endpoint: '/api/queue/status',
      ...status.stats,
    });

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Queue status retrieved',
      data: status,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

 // Get WhatsApp Status Controller
 // Returns current WhatsApp connection status
export const getStatusController = async (req, res, next) => {
  try {
    const whatsappStatus = whatsAppService.getState();
    const queueStatus = queueManager.getStatus();

    logInfo('Status requested', {
      endpoint: '/api/status',
      whatsappState: whatsappStatus.state,
    });

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: API_MESSAGES.SUCCESS,
      data: {
        whatsapp: whatsappStatus,
        queue: queueStatus,
        system: {
          timestamp: new Date(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

 // Initialize WhatsApp Controller
 // Starts WhatsApp authentication process
export const initializeWhatsAppController = async (req, res, next) => {
  try {
    if (whatsAppService.client) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: 'error',
        message: 'WhatsApp is already initialized',
        state: whatsAppService.getState(),
      });
    }

    // Initialize WhatsApp (socket.io passed from middleware or global)
    logInfo('WhatsApp initialization requested');

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'WhatsApp initialization started. Check socket connection for QR code.',
      state: whatsAppService.getState(),
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

export default sendMessageController;