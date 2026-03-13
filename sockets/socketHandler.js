import { whatsAppService } from '../services/whatsappService.js';
import { logInfo, logDebug } from '../utils/logger.js';

// === Socket.IO handlers === //
// TODO: `authenticate` event - Start WhatsApp auth
// TODO: `get_status` event - Request status
// TODO: `get_clients_count` event - Connected clients
// TODO: `ping/pong` event - Keep-alive
// TODO: Disconnect handling

 // Socket.IO Event Handler
 // Manages real-time communication between server and clients

function socketHandler(io) {
  // Store connected clients
  const connectedClients = new Map();

  io.on('connection', (socket) => {
    const clientId = socket.id;

    logInfo('Client connected via Socket.IO', {
      clientId,
      totalConnected: io.engine.clientsCount,
    });

    // Store client information
    connectedClients.set(clientId, {
      id: clientId,
      connectedAt: new Date(),
      lastActivity: new Date(),
    });

    
     // Get current status
     // Returns WhatsApp connection state and client info
    socket.on('get_status', () => {
      try {
        const status = whatsAppService.getState();

        logDebug('Status requested', {
          clientId,
          status: status.state,
        });

        socket.emit('status_update', {
          success: true,
          ...status,
          timestamp: new Date(),
        });
      } catch (error) {
        socket.emit('error', {
          success: false,
          message: 'Failed to get status',
          error: error.message,
        });
      }
    });

     // Initialize WhatsApp authentication
     // Sends the socket.io instance to WhatsApp service for real-time updates
    socket.on('authenticate', async () => {
      try {
        logInfo('Authentication requested', { clientId });

        // If already connected, send current status
        if (whatsAppService.isReady()) {
          socket.emit('already_authenticated', {
            success: true,
            message: 'WhatsApp is already authenticated',
            state: whatsAppService.getState(),
            timestamp: new Date(),
          });
          return;
        }

        // Initialize WhatsApp with socket.io for real-time updates
        await whatsAppService.initialize(socket);

        logInfo('WhatsApp initialization started', { clientId });

        socket.emit('authentication_started', {
          success: true,
          message: 'Authentication process started',
          timestamp: new Date(),
        });
      } catch (error) {
        logInfo('Authentication error', {
          clientId,
          error: error.message,
        });

        socket.emit('error', {
          success: false,
          message: 'Authentication failed',
          error: error.message,
          timestamp: new Date(),
        });
      }
    });

     // Get connected clients count
    socket.on('get_clients_count', () => {
      socket.emit('clients_count', {
        count: connectedClients.size,
        totalConnections: io.engine.clientsCount,
        timestamp: new Date(),
      });
    });

     // Keep-alive / Ping event
    socket.on('ping', () => {
      const client = connectedClients.get(clientId);
      if (client) {
        client.lastActivity = new Date();
      }

      socket.emit('pong', {
        timestamp: new Date(),
        clientId,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      connectedClients.delete(clientId);

      logInfo('Client disconnected', {
        clientId,
        totalConnected: io.engine.clientsCount - 1,
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logInfo('Socket error', {
        clientId,
        error: error.message || error,
      });
    });

    //Debugging helper
    socket.on('get_queue_status', () => {
      try {
        // This will be emitted from the main server
        socket.emit('request_queue_status');
      } catch (error) {
        socket.emit('error', {
          success: false,
          message: 'Failed to get queue status',
        });
      }
    });
  });

  return {
    getConnectedClients: () => connectedClients,
    getClientCount: () => connectedClients.size,
  };
}

export default socketHandler;