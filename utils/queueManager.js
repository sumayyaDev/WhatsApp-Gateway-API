import { logInfo, logError, logDebug } from '../utils/logger.js';
import { QUEUE_STATE, LOG_EVENTS } from '../constants/constants.js';
import { QueueError } from '../utils/CustomError.js';
import config from '../config/config.js';

// === Message queue management === //
// Helper functions: logInfo, logError, logWarn, logDebug, logHTTP
//  Queue management with pending/processing states
// Automatic retry logic (configurable attempts)
// Concurrent message processing

class QueueManager {
  constructor() {
    this.queue = [];
    this.processing = new Set();
    this.stats = {
      totalQueued: 0,
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
    };
    this.maxConcurrent = config.queue.concurrentLimit;
    this.maxRetries = config.queue.maxRetries;
    this.retryDelay = config.queue.retryDelay;
  }

  addToQueue(phone, message, metadata = {}) {
    
    if (this.queue.length >= this.maxConcurrent * 2) {
      throw new QueueError('Message queue is full. Please try again later.');
    }

    const queueItem = {
      id: this.generateId(),
      phone,
      message,
      metadata,
      state: QUEUE_STATE.PENDING,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: null,
      error: null,
    };

    this.queue.push(queueItem);
    this.stats.totalQueued++;

    logDebug('Message added to queue', {
      queueId: queueItem.id,
      phone,
      queueLength: this.queue.length,
      processingCount: this.processing.size,
    });

    return queueItem;
  }


  async processQueue(sendMessageFn) {
    while (this.queue.length > 0 && this.processing.size < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.processing.add(item.id);
      item.state = QUEUE_STATE.PROCESSING;
      item.updatedAt = new Date();

      try {
        // Send message
        await sendMessageFn(item.phone, item.message);

        // Mark as sent
        item.state = QUEUE_STATE.SENT;
        item.sentAt = new Date();
        this.stats.totalSent++;

        logInfo(LOG_EVENTS.MESSAGE_SENT, {
          queueId: item.id,
          phone: item.phone,
          duration: `${Date.now() - item.createdAt.getTime()}ms`,
        });
      } catch (error) {
        if (item.retries < this.maxRetries) {
          item.retries++;
          item.state = QUEUE_STATE.RETRYING;
          item.error = error.message;
          this.stats.totalRetries++;

          logDebug('Message retry scheduled', {
            queueId: item.id,
            phone: item.phone,
            retryCount: item.retries,
            maxRetries: this.maxRetries,
          });

          setTimeout(() => {
            this.queue.unshift(item);
          }, this.retryDelay);
        } else {
          item.state = QUEUE_STATE.FAILED;
          item.error = error.message;
          this.stats.totalFailed++;

          logError('Message failed after all retries', error, {
            queueId: item.id,
            phone: item.phone,
            retries: item.retries,
          });
        }
      } finally {
        this.processing.delete(item.id);
        item.updatedAt = new Date();

        logDebug('Queue item processed', {
          queueId: item.id,
          state: item.state,
          queueLength: this.queue.length,
          processingCount: this.processing.size,
        });
      }
    }
  }

  // queue status
  getStatus() {
    return {
      queue: {
        pending: this.queue.filter((item) => item.state === QUEUE_STATE.PENDING)
          .length,
        processing: this.processing.size,
        total: this.queue.length,
      },
      stats: { ...this.stats },
      capacity: {
        current: this.queue.length + this.processing.size,
        max: this.maxConcurrent * 2,
        maxConcurrent: this.maxConcurrent,
      },
      health: {
        successRate:
          this.stats.totalSent / (this.stats.totalSent + this.stats.totalFailed) ||
          0,
        totalRetries: this.stats.totalRetries,
      },
    };
  }

   // Get queue item status by ID
  getQueueItemStatus(queueId) {
    const item = this.queue.find((item) => item.id === queueId);
    if (processing.has(queueId)) {
      return { state: QUEUE_STATE.PROCESSING };
    }
    return item || null;
  }


  clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    logInfo('Queue cleared', { clearedCount: count });
    return count;
  }

  // generate queue id
  generateId() {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

   // Reset statistics
  resetStats() {
    this.stats = {
      totalQueued: 0,
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
    };
  }
}

// Export singleton instance
export const queueManager = new QueueManager();
export default QueueManager;
