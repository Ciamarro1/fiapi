import { Hono } from 'hono';
import healthRouter from './routers/health.js';
import docsRouter from './routers/docs.js';
import imagesRouter from './routers/images.js';

const app = new Hono();

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${err.stack || err}`);
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

// Global 404 Handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

// Mount Routers
app.route('/health', healthRouter);
app.route('/docs', docsRouter);
app.route('/v1', imagesRouter);

export default app;
