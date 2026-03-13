import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode';
import config from '../config/config.js';
import { logInfo, logError, logDebug } from '../utils/logger.js';
import { WhatsAppError } from '../utils/CustomError.js';
import { CONNECTION_STATE, LOG_EVENTS } from '../constants/constants.js';

// === WhatsApp integration === //
// TODO: QR code generation and event handling
// TODO: Session persistence via LocalAuth
// TODO: Automatic reconnection with configurable attempts
// TODO: Event handlers (qr, ready, authenticated, disconnected, error)
// TODO: State management (CONNECTED, DISCONNECTED, AUTHENTICATING, etc.)
// TODO: Phone number formatting
// TODO: Message sending with timeout
// TODO: Client status tracking

const { Client, LocalAuth } = pkg;

 // WhatsApp Service
 // Manages WhatsApp Web client lifecycle, session persistence, and messaging
class WhatsAppService {
  constructor() {
    this.client = null;
    this.state = CONNECTION_STATE.DISCONNECTED;
    this.io = null;
    this.reconnectAttempts = 0;
    this.qrTimeout = null;
    this.isInitializing = false;
  }

  // Initialize WhatsApp client
  async initialize(io) {
    if (this.isInitializing || this.client) {
      logDebug('WhatsApp already initialized or initializing');
      return;
    }

    this.isInitializing = true;
    this.io = io;

    try {
      logInfo(LOG_EVENTS.AUTH_START, {
        sessionName: config.whatsapp.sessionName,
      });

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: config.whatsapp.sessionName,
        }),
      
        puppeteer: {
        headless: config.whatsapp.headless,
        executablePath: config.whatsapp.chromePath,
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
        ]},
        
        restartOnAuthFail: true,
        webVersionCache: {
          type: 'remote',
          remotePath:
            'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/client.html',
        },
      });

      // ===== EVENT HANDLERS =====

      // QR Code Event - Authentication Required
      this.client.on('qr', async (qr) => {
        try {
          this.state = CONNECTION_STATE.WAITING_FOR_QR;

          const qrImage = await qrcode.toDataURL(qr);

          logInfo(LOG_EVENTS.QR_GENERATED, {
            timestamp: new Date(),
          });

          // Emit QR code to all connected clients
          if (this.io) {
            this.io.emit('qr', {
              success: true,
              qr: qrImage,
              message: 'Please scan the QR code with your WhatsApp',
              timestamp: new Date(),
            });
          }

          this.setQRTimeout();
        } catch (error) {
          logError('Error generating QR code', error);
        }
      });

      // Ready Event - Successfully authenticated
      this.client.on('ready', () => {
        this.state = CONNECTION_STATE.CONNECTED;
        this.reconnectAttempts = 0;
        this.clearQRTimeout();

        logInfo(LOG_EVENTS.WHATSAPP_CONNECTED, {
          timestamp: new Date(),
          user: this.client.info?.wid?.user || 'unknown',
        });

        // Notify clients
        if (this.io) {
          this.io.emit('ready', {
            success: true,
            message: 'WhatsApp is ready',
            state: this.state,
            timestamp: new Date(),
          });
        }
      });

      // Authenticated Event
      this.client.on('authenticated', () => {
        logInfo(LOG_EVENTS.AUTH_SUCCESS, {
          timestamp: new Date(),
        });

        if (this.io) {
          this.io.emit('authenticated', {
            success: true,
            message: 'Authentication successful',
            timestamp: new Date(),
          });
        }
      });

      // Disconnected Event
      this.client.on('disconnected', (reason) => {
        this.state = CONNECTION_STATE.DISCONNECTED;

        logInfo(LOG_EVENTS.WHATSAPP_DISCONNECTED, {
          reason,
          reconnectAttempts: this.reconnectAttempts,
        });

        if (this.io) {
          this.io.emit('disconnected', {
            success: false,
            message: `Disconnected: ${reason}`,
            state: this.state,
            timestamp: new Date(),
          });
        }

        // Attempt to reconnect
        this.attemptReconnect();
      });

      // Session Expired
      this.client.on('auth_failure', (msg) => {
        this.state = CONNECTION_STATE.ERROR;

        logError('Authentication failed', new Error(msg), {
          message: msg,
        });

        if (this.io) {
          this.io.emit('auth_failure', {
            success: false,
            message: `Authentication failed: ${msg}`,
            state: this.state,
            timestamp: new Date(),
          });
        }
      });

      // Client error
      this.client.on('error', (error) => {
        logError('WhatsApp client error', error, {
          state: this.state,
        });

        if (this.io) {
          this.io.emit('error', {
            success: false,
            message: `Error: ${error.message}`,
            error: error.message,
            timestamp: new Date(),
          });
        }
      });

      // Add new additional handlers as needed
      this.client.on('message', (msg) => {
        logDebug('Message received', {
          from: msg.from,
          type: msg.type,
        });
      });

      // Initialize client
      await this.client.initialize();

      logInfo('WhatsApp service initialized successfully');
    } catch (error) {
      this.state = CONNECTION_STATE.ERROR;
      logError('Failed to initialize WhatsApp service', error);
      throw new WhatsAppError(`Failed to initialize WhatsApp: ${error.message}`);
    } finally {
      this.isInitializing = false;
    }
  }

  
   ///////Send message via WhatsApp////////
  
  async sendMessage(phone, message) {
    if (!this.client) {
      throw new WhatsAppError('WhatsApp client is not initialized');
    }

    if (this.state !== CONNECTION_STATE.CONNECTED) {
      throw new WhatsAppError(
        `WhatsApp is not connected. Current state: ${this.state}`
      );
    }

    try {
      // Format phone number for WhatsApp
      const chatId = this.formatPhoneNumber(phone);

      logDebug('Sending message', {
        phone,
        chatId,
        messageLength: message.length,
      });

      // Send message with timeout
      const sendPromise = this.client.sendMessage(chatId, message);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Message send timeout')),
          config.queue.concurrentLimit * 1000
        )
      );

      const result = await Promise.race([sendPromise, timeoutPromise]);

      logInfo('Message sent successfully', {
        phone,
        messageId: result?.id,
      });

      return result;
    } catch (error) {
      logError('Failed to send message', error, {
        phone,
        messageLength: message.length,
      });

      throw new WhatsAppError(`Failed to send message: ${error.message}`);
    }
  }

   // Format phone number to WhatsApp format (Bangladesh)
  formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (Bangladesh: 880)
    let formatted = cleaned;
    
    if (cleaned.length === 10) {
      // 10 digits - assume Bangladesh local format, add country code
      formatted = '880' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // 11 digits starting with 0 - Bangladesh domestic format (0XXXXXXXXXX)
      // Remove leading 0 and add country code
      formatted = '880' + cleaned.substring(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('880')) {
      // Already has country code (880XXXXXXXXXX)
      formatted = cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('880')) {
      // International format without + (+880XXXXXXXXXX already converted)
      formatted = cleaned;
    } else {
      // Use as-is 
      formatted = cleaned;
    }

    return formatted + '@c.us';
  }

   // Get connection state
  getState() {
    return {
      state: this.state,
      isConnected: this.state === CONNECTION_STATE.CONNECTED,
      isAuthenticating:
        this.state === CONNECTION_STATE.AUTHENTICATING ||
        this.state === CONNECTION_STATE.WAITING_FOR_QR,
      isInitializing: this.isInitializing,
      reconnectAttempts: this.reconnectAttempts,
      clientInfo: this.client?.info || null,
    };
  }

   // Disconnect WhatsApp client
  async disconnect() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
        this.state = CONNECTION_STATE.DISCONNECTED;

        logInfo('WhatsApp client disconnected');
      }
    } catch (error) {
      logError('Error disconnecting WhatsApp', error);
    }
  }

   // Attempt to reconnect
  async attemptReconnect() {
    if (this.reconnectAttempts >= config.whatsapp.maxReconnectAttempts) {
      logError('Max reconnection attempts reached');
      this.state = CONNECTION_STATE.ERROR;

      if (this.io) {
        this.io.emit('reconnect_failed', {
          success: false,
          message: 'Maximum reconnection attempts reached',
          state: this.state,
          timestamp: new Date(),
        });
      }
      return;
    }

    this.reconnectAttempts++;
    this.state = CONNECTION_STATE.RECONNECTING;

    logInfo('Attempting to reconnect', {
      attempt: this.reconnectAttempts,
      maxAttempts: config.whatsapp.maxReconnectAttempts,
    });

    if (this.io) {
      this.io.emit('reconnecting', {
        success: false,
        message: `Reconnecting... (Attempt ${this.reconnectAttempts}/${config.whatsapp.maxReconnectAttempts})`,
        state: this.state,
        timestamp: new Date(),
      });
    }

    // Wait before attempting reconnect
    setTimeout(() => {
      if (this.client) {
        this.client.initialize().catch((error) => {
          logError('Reconnect attempt failed', error);
        });
      }
    }, config.whatsapp.reconnectTimeout);
  }


   // Set QR code timeout
  setQRTimeout() {
    this.qrTimeout = setTimeout(() => {
      logError('QR code timeout - user did not scan within time limit');

      if (this.io) {
        this.io.emit('qr_timeout', {
          success: false,
          message: 'QR code expired. Please refresh.',
          timestamp: new Date(),
        });
      }

      // reinitialize
      this.initialize(this.io).catch((error) => {
        logError('Failed to reinitialize after QR timeout', error);
      });
    }, config.whatsapp.qrCodeTimeout);
  }

  clearQRTimeout() {
    if (this.qrTimeout) {
      clearTimeout(this.qrTimeout);
      this.qrTimeout = null;
    }
  }

   // if client is ready
  isReady() {
    return this.state === CONNECTION_STATE.CONNECTED && this.client !== null;
  }

  getClientInfo() {
    return this.client?.info || null;
  }
}

// Export singleton instance
export const whatsAppService = new WhatsAppService();

export default whatsAppService;

export async function sendMessage(phone, message) {
  return whatsAppService.sendMessage(phone, message);
}

export async function initWhatsapp(io) {
  return whatsAppService.initialize(io);
}