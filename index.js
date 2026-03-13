import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config/config.js';
import app from './app.js';
import socketHandler from './sockets/socketHandler.js';
import { whatsAppService } from './services/whatsappService.js';
import { logInfo, logError } from './utils/logger.js';

//=== Server initialization ===

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  },
  transports: ['websocket', 'polling'],
});

socketHandler(io);

global.io = io;


async function initializeWhatsApp() {
  try {
    logInfo('Initializing WhatsApp service...');
    await whatsAppService.initialize(io);
    logInfo('WhatsApp service initialized');
  } catch (error) {
    logError('Failed to initialize WhatsApp service', error);
  }
}

async function startServer() {
  try {
    // Initialize WhatsApp
    await initializeWhatsApp();

    // Start HTTP/Socket.IO server
    server.listen(config.server.port, config.server.host, () => {
      logInfo('Server started successfully', {
        host: config.server.host,
        port: config.server.port,
        environment: config.server.nodeEnv,
        url: `http://${config.server.host}:${config.server.port}`,
      });

      console.log('\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✌️ WhatsApp Backend Server Started');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Host: ${config.server.host}`);
      console.log(`Port: ${config.server.port}`);
      console.log(`Environment: ${config.server.nodeEnv}`);
      console.log(`URL: http://${config.server.host}:${config.server.port}`);
      console.log(`Dashboard: http://${config.server.host}:${config.server.port}/dashboard`);
      console.log('═══════════════════════════════════════════════════════\n');
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  logInfo('Graceful shutdown initiated...');

  try {
    // Disconnect WhatsApp
    await whatsAppService.disconnect();
    logInfo('WhatsApp disconnected');
  } catch (error) {
    logError('Error disconnecting WhatsApp', error);
  }

  try {
    // Close server
    server.close(() => {
      logInfo('Server closed');
      process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      logError('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } catch (error) {
    logError('Error during graceful shutdown', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logError('Unhandled Rejection', error);
  gracefulShutdown();
});

startServer();