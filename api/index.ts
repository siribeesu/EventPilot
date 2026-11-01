import type { IncomingMessage, ServerResponse } from 'http';
// @ts-ignore
import app from '../server/dist/app.js';

export const config = {
  maxDuration: 30,
};

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  headersSent: boolean;
  status: (statusCode: number) => { json: (body: unknown) => void };
}

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  try {
    // If Vercel rewrote /api/... to /api, reconstruct the real requested path
    if (req.url === '/api' || req.url === '/api/' || req.url?.startsWith('/api?') || req.url === '/' || req.url?.startsWith('/?')) {
      const forwarded = req.headers['x-forwarded-uri'];
      if (forwarded && typeof forwarded === 'string' && forwarded.startsWith('/api')) {
        req.url = forwarded;
      } else if (req.query && req.query.__path) {
        const p = Array.isArray(req.query.__path) ? req.query.__path.join('/') : req.query.__path;
        delete req.query.__path;
        req.url = `/api/${p}`;
      }
    }
    return app(req, res);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    // eslint-disable-next-line no-console
    console.error('Serverless Handler Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: errorMsg,
      });
    }
  }
}
