// @ts-ignore
import app from '../server/dist/app.js';

export const config = {
  maxDuration: 30,
};

export default function handler(req: any, res: any) {
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
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || 'Internal Server Error',
      });
    }
  }
}
