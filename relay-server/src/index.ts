import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleConnection } from './ws-handler.js';

const app = new Hono();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

app.use('*', cors());

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = req as unknown as BodyInit;
  }

  try {
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Request handling error:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws, req) => {
  handleConnection(ws, req);
});

httpServer.listen(PORT, () => {
  console.log(`Relay server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
