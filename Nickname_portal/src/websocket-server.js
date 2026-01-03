/**
 * WebSocket Server for Barcode Scanning
 * Handles real-time barcode scanning from mobile devices
 * and broadcasts to connected billing pages
 */

const { Server } = require('socket.io');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Configuration
const WS_PORT = process.env.WS_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const WS_USE_HTTPS = process.env.WS_USE_HTTPS === 'true' || NODE_ENV === 'production';

// Allowed origins for CORS (production domain)
const ALLOWED_ORIGINS = process.env.WS_ALLOWED_ORIGINS 
  ? process.env.WS_ALLOWED_ORIGINS.split(',')
  : ['https://admin.nicknameportal.shop', 'http://localhost:5173', 'http://localhost:3000', '*'];

let lastBarcode = '';
let lastScanTime = null;
let io = null; // Will be initialized after server creation

// Create Express app for health check endpoint
const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

// Create HTTP or HTTPS server
let server;
if (WS_USE_HTTPS) {
  // Try to load SSL certificates (if available)
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'ssl', 'cert.pem');
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'ssl', 'key.pem');
  
  try {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
      server = https.createServer(options, app);
      console.log('[WebSocket] Using HTTPS with SSL certificates');
    } else {
      console.warn('[WebSocket] HTTPS requested but certificates not found, falling back to HTTP');
      console.warn(`[WebSocket] Expected cert at: ${certPath}`);
      console.warn(`[WebSocket] Expected key at: ${keyPath}`);
      server = http.createServer(app);
    }
  } catch (error) {
    console.error('[WebSocket] Error loading SSL certificates:', error.message);
    console.warn('[WebSocket] Falling back to HTTP');
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

// Initialize Socket.IO with proper CORS
io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Allow Engine.IO v3 clients
  pingTimeout: 60000,
  pingInterval: 25000
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
  server.listen(WS_PORT, '0.0.0.0', () => {
    const protocol = WS_USE_HTTPS ? 'https' : 'http';
    console.log(`[WebSocket] Barcode WebSocket server running on port ${WS_PORT}`);
    console.log(`[WebSocket] Protocol: ${protocol.toUpperCase()}`);
    console.log(`[WebSocket] Health check: ${protocol}://localhost:${WS_PORT}/health`);
    console.log(`[WebSocket] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
    
    if (NODE_ENV === 'production') {
      console.log(`[WebSocket] Production mode - ensure reverse proxy is configured for WSS`);
    }
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

