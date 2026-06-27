import { Hono } from 'hono';

const router = new Hono();

router.get('/', (c) => {
  return c.json({ status: 'ok' });
});

router.options('/', (c) => {
  return new Response(null, { status: 204 });
});

router.all('/', (c) => {
  return c.text('Method Not Allowed', 405);
});

export default router;
