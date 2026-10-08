const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WebSocket] Client connected. Total active clients: ${clients.size}`);

  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Connected to Event Sphere real-time telemetry stream',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('[WebSocket Message Received]:', data.type);

      // Broadcast to all other connected clients
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            ...data,
            broadcastedAt: new Date().toISOString()
          }));
        }
      }
    } catch (err) {
      console.error('[WebSocket Error]:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Active clients: ${clients.size}`);
  });
});

// REST Health & Webhook routes
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'node-realtime-service',
    activeConnections: clients.size,
    uptime: process.uptime()
  });
});

app.post('/api/realtime/broadcast', (req, res) => {
  const { eventType, payload } = req.body;
  const messageStr = JSON.stringify({
    type: eventType || 'GENERIC_BROADCAST',
    payload,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  }

  res.json({ success: true, broadcastCount: clients.size });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Event Sphere Realtime Service] listening on http://localhost:${PORT}`);
});
