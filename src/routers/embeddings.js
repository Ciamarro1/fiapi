import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, requireString, parseBody } from '../utils/platform.js';

const router = new Hono();

const MODELS = [
  { id: '@cf/baai/bge-base-en-v1.5',       name: 'BGE Base EN v1.5' },
  { id: '@cf/baai/bge-large-en-v1.5',      name: 'BGE Large EN v1.5' },
  { id: '@cf/baai/bge-small-en-v1.5',      name: 'BGE Small EN v1.5' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'embeddings' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/create', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { input, model: reqModel } = body;

  if (!input || (typeof input !== 'string' && !Array.isArray(input)))
    return err(c, 'input must be a string or array of strings');

  const inputs = Array.isArray(input) ? input : [input];
  if (inputs.some(t => typeof t !== 'string' || t.trim() === ''))
    return err(c, 'Each input must be a non-empty string');

  if (reqModel !== undefined && !MODEL_IDS.includes(reqModel))
    return err(c, 'Unsupported or invalid model');

  const model  = reqModel || '@cf/baai/bge-base-en-v1.5';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  if (isMock) {
    const mockEmbeddings = inputs.map((_, i) => ({
      index: i,
      embedding: Array.from({ length: 768 }, () => Math.random() - 0.5),
      object: 'embedding'
    }));
    return ok(c, { embeddings: mockEmbeddings, model, usage: { total_tokens: inputs.join(' ').split(' ').length } });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const res = await c.env.AI.run(model, { text: inputs });
    const embeddings = (res.data || res).map((emb, i) => ({ index: i, embedding: emb, object: 'embedding' }));
    return ok(c, { embeddings, model, usage: res.usage || {} });
  } catch (e) {
    return err(c, `Embedding generation failed: ${e.message}`, 500);
  }
});

router.options('/create', () => noContent());
router.all('/create',     (c) => notAllowed(c));

export default router;
