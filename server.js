/**
 * Verix Web — Production Static Asset & Health Server
 * Built with native Node.js HTTP for instant start and zero dependencies on Render.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Active SSE Clients & Recent Intents Buffer
let sseClients = [];
let recentIntents = [];

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Healthcheck endpoint for Render
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'verix-web', uptime: process.uptime() }));
    return;
  }

  // 📡 Real-Time SSE Stream for Frontend Web Dashboard
  if (req.url === '/api/v1/intent/stream' || req.url === '/api/intent/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('data: {"type":"CONNECTED","message":"Verix Real-Time Stream Connected"}\n\n');
    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(client => client !== res);
    });
    return;
  }

  // 📋 Fetch Latest Recent Intents (Polling Fallback for file:// or mobile)
  if (req.url === '/api/v1/intent/latest' || req.url === '/api/intent/latest') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify({ success: true, count: recentIntents.length, intents: recentIntents }));
    return;
  }

  // ⚡ Webhook to trigger incoming UPI Intent from CURL / External Device
  if ((req.url === '/api/v1/intent/incoming' || req.url === '/api/intent/incoming') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const intentData = {
          id: 'intent-' + Date.now(),
          vpa: payload.vpa || 'cbi.verification@paytm',
          amount: parseFloat(payload.amount) || 45000,
          name: payload.name || payload.recipientName || 'Suspected Scammer',
          note: payload.note || 'Urgent payment demand',
          activeCall: payload.activeCall !== undefined ? payload.activeCall : (payload.deviceContext?.activeCallDetected || true),
          threatCategory: payload.threatCategory || 'Live Inbound Intent',
          timestamp: new Date().toISOString()
        };

        // Save to buffer (keep latest 20)
        recentIntents.unshift(intentData);
        if (recentIntents.length > 20) recentIntents.pop();

        // Broadcast to all connected frontend browser dashboards
        const eventData = `data: ${JSON.stringify({ type: 'NEW_INTENT', data: intentData })}\n\n`;
        sseClients.forEach(client => {
          try { client.write(eventData); } catch (e) {}
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          message: 'Intent pushed live to dashboard!',
          broadcastedToClients: sseClients.length,
          data: intentData
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/swagger' || reqPath === '/swagger/') {
    reqPath = '/swagger/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if it's a directory containing index.html
      const subIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(subIndex)) {
        filePath = subIndex;
      } else {
        // Fallback to root index.html for client-side routing
        filePath = path.join(PUBLIC_DIR, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️ Verix Web Dashboard listening on port ${PORT}`);
});
