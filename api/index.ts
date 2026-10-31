import app from '../server/src/app.js';

export default function handler(req: any, res: any) {
  // Ensure req.url preserves the forwarded URI or path on Vercel
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedUri && typeof forwardedUri === 'string' && (forwardedUri.startsWith('/api') || forwardedUri.startsWith('/'))) {
    const queryIndex = req.url ? req.url.indexOf('?') : -1;
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : '';
    req.url = forwardedUri.split('?')[0] + queryString;
  }
  return app(req, res);
}
