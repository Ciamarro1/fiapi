import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, parseBody } from '../utils/platform.js';

const router = new Hono();

// Video generation is not yet available in Workers AI.
// This router provides a standardized stub with extensible architecture,
// ready to bind any future video model as it becomes available.

const MODELS = [
  { id: 'fiapi/video-stub-v1', name: 'FIAPI Video Stub (Preview)', status: 'coming_soon' },
];

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'video', notice: 'Video generation is in preview. Endpoint is ready; models coming soon.' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/generate', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '')
    return err(c, 'prompt is required');

  // Stub response — placeholder until Workers AI adds video models
  return ok(c, {
    status: 'queued',
    notice: 'Video generation is not yet available in Workers AI. This endpoint is reserved for future use.',
    prompt,
    estimated_model: 'fiapi/video-stub-v1'
  }, { domain: 'video' });
});

router.options('/generate', () => noContent());
router.all('/generate',     (c) => notAllowed(c));

export default router;
