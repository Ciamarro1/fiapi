import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, parseBody } from '../utils/platform.js';

const router = new Hono();

const MODELS = [
  { id: '@cf/llava-hf/llava-1.5-7b-hf', name: 'LLaVA 1.5 7B' },
  { id: '@cf/unum/uform-gen2-qwen-500m', name: 'UForm Gen2 Qwen 500M' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'vision' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/analyze', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { image, prompt, model: reqModel } = body;

  if (!image || typeof image !== 'string' || image.trim() === '')
    return err(c, 'image must be a base64-encoded string');
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '')
    return err(c, 'prompt is required');

  if (reqModel !== undefined && !MODEL_IDS.includes(reqModel))
    return err(c, 'Unsupported or invalid model');

  const model  = reqModel || '@cf/llava-hf/llava-1.5-7b-hf';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  if (isMock) {
    return ok(c, { description: '[Mock] A sample image description from FIAPI Vision.', model, prompt });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    // Decode base64 to Uint8Array for Workers AI vision model
    const bin      = atob(image.replace(/^data:[^;]+;base64,/, ''));
    const bytes    = Uint8Array.from(bin, c => c.charCodeAt(0));
    const res      = await c.env.AI.run(model, { image: [...bytes], prompt, max_tokens: 512 });
    return ok(c, { description: res.description || res.response || res, model, prompt });
  } catch (e) {
    return err(c, `Vision analysis failed: ${e.message}`, 500);
  }
});

router.options('/analyze', () => noContent());
router.all('/analyze',     (c) => notAllowed(c));

export default router;
