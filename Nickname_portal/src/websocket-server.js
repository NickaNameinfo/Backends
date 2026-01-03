/**
 * WebSocket Server for Barcode Scanning
 * Handles real-time barcode scanning from mobile devices
 * and broadcasts to connected billing pages
 */

const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');

// Configuration
const WS_PORT = process.env.WS_PORT || 3001;
let lastBarcode = '';
let lastScanTime = null;
let io = null; // Will be initialized after server creation

// Create Express app for health check endpoint
const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (restrict in production)
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Health check endpoint (after io is initialized)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    lastBarcode: lastBarcode,
    timestamp: lastScanTime ? new Date(lastScanTime).toISOString() : null,
    connectedClients: io ? io.sockets.sockets.size : 0
  });
});

// Store connected clients info
const connectedClients = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  const clientId = socket.id;
  const clientInfo = {
    id: clientId,
    connectedAt: new Date(),
    type: 'unknown' // 'scanner' or 'billing'
  };
  
  connectedClients.set(clientId, clientInfo);
  
  console.log(`[WebSocket] Client connected: ${clientId}`);
  console.log(`[WebSocket] Total connected clients: ${connectedClients.size}`);

  // Handle client type identification
  socket.on('client-type', (type) => {
    if (clientInfo) {
      clientInfo.type = type; // 'scanner' or 'billing'
      console.log(`[WebSocket] Client ${clientId} identified as: ${type}`);
    }
  });

  // Handle barcode scanning from mobile scanner
  socket.on('scan-product', (data) => {
    const barcode = typeof data === 'string' ? data : (data?.barcode || data?.code || '');
    
    if (!barcode) {
      console.warn(`[WebSocket] Received empty barcode from ${clientId}`);
      return;
    }

    lastBarcode = barcode;
    lastScanTime = Date.now();

    console.log(`[WebSocket] Barcode received from ${clientId}: ${barcode}`);

    // Broadcast to all connected clients (especially billing pages)
    io.emit('product-barcode', {
      barcode: barcode,
      timestamp: lastScanTime,
      scannerId: clientId
    });

    // Send confirmation back to scanner
    socket.emit('barcode-sent', {
      success: true,
      barcode: barcode,
      timestamp: lastScanTime
    });
  });

  // Handle manual barcode input (for testing)
  socket.on('manual-barcode', (data) => {
    const barcode = typeof data === 'string' ? data : (data?.barcode || '');
    
    if (!barcode) {
      socket.emit('error', { message: 'Barcode is required' });
      return;
    }

    lastBarcode = barcode;
    lastScanTime = Date.now();

    console.log(`[WebSocket] Manual barcode from ${clientId}: ${barcode}`);

    // Broadcast to all connected clients
    io.emit('product-barcode', {
      barcode: barcode,
      timestamp: lastScanTime,
      scannerId: clientId,
      source: 'manual'
    });

    socket.emit('barcode-sent', {
      success: true,
      barcode: barcode,
      timestamp: lastScanTime
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    connectedClients.delete(clientId);
    console.log(`[WebSocket] Client disconnected: ${clientId}, reason: ${reason}`);
    console.log(`[WebSocket] Total connected clients: ${connectedClients.size}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`[WebSocket] Error from client ${clientId}:`, error);
  });

  // Send connection confirmation
  socket.emit('connected', {
    clientId: clientId,
    serverTime: new Date().toISOString(),
    lastBarcode: lastBarcode
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('[WebSocket] Server error:', error);
});

// Start server
const startWebSocketServer = () => {
  server.listen(WS_PORT, () => {
    console.log(`[WebSocket] Barcode WebSocket server running on port ${WS_PORT}`);
    console.log(`[WebSocket] Health check: http://localhost:${WS_PORT}/health`);
  });
};

// Graceful shutdown
const stopWebSocketServer = () => {
  return new Promise((resolve) => {
    io.close(() => {
      server.close(() => {
        console.log('[WebSocket] Server stopped');
        resolve();
      });
    });
  });
};

// Export for use in main app
module.exports = {
  io,
  startWebSocketServer,
  stopWebSocketServer,
  getLastBarcode: () => lastBarcode,
  getLastScanTime: () => lastScanTime,
  getConnectedClients: () => connectedClients.size
};

// If running as standalone script
if (require.main === module) {
  startWebSocketServer();
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[WebSocket] SIGTERM received, shutting down gracefully...');
    stopWebSocketServer().then(() => process.exit(0));
  });
  
  process.on('SIGINT', () => {
    console.log('[WebSocket] SIGINT received, shutting down gracefully...');
    stopWebSocketServer().then(() => process.exit(0));
  });
}

