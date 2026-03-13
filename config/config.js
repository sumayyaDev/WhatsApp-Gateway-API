// TODO: Centralized configuration management
// TODO: Environment variables loading
// TODO: WhatsApp service configuration
// TODO: Queue, rate limiting, and logging settings
// TODO: Path management for sessions and logs

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const config = {
  // Server setup
  server: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000"),
    host:
      process.env.NODE_ENV === "production"
        ? "0.0.0.0"
        : (process.env.HOST || "localhost"),

    isDevelopment: (process.env.NODE_ENV || "development") === "development",
    isProduction: process.env.NODE_ENV === 'production',
  },


  // WhatsAp setup
  whatsapp: {
    sessionName: process.env.WHATSAPP_SESSION_NAME || "whatsapp-session",
    headless: process.env.WHATSAPP_HEADLESS === "true",
    chromePath: process.env.WHATSAPP_CHROME_PATH || undefined,
    sessionPath: path.join(rootDir, ".wwebjs_auth"),
    qrCodeTimeout: 60000,  // 1 minute
    reconnectTimeout: 5000, // 5 seconds
    maxReconnectsAttempts: 5, 
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || "development-secret-key",
    timeout: parseInt(process.env.SESSION_TIMEOUT || "86400000"),
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000") ,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "20"),
  },

  // Queue config
  queue: {
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || "3"),
    retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || "5000"),
    concurrentLimit: parseInt(process.env.QUEUE_CONCURRENT_LIMIT || "5"),
  },

  // logging config
  logging: {
    level: process.env.LOG_LEVEL || "info",
    logFile: path.join(rootDir, process.env.LOG_FILE || "logs/app.log"),
    logsDir: path.join(rootDir, "logs"),
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credential: true,
  },

  paths: {
    root: rootDir,
    logs: path.join(rootDir, "logs"),
    sessions: path.join(rootDir, ".wwebjs_auth"),
  },
  
};

export default config;

