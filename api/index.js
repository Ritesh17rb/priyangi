import app, { ensureServerReady, requiresDatabase } from '../server/src/app.js';

export default async function handler(req, res) {
  const pathname = req.url ? new URL(req.url, 'https://priyangi.local').pathname : '';

  if (requiresDatabase(pathname)) {
    try {
      await ensureServerReady();
    } catch (error) {
      return res.status(503).json({
        error: error?.message || 'Database not connected.',
      });
    }
  }

  return app(req, res);
}
