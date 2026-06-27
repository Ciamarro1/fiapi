import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, requireString, parseBody } from '../utils/platform.js';

const router = new Hono();

const MODELS = [
  { id: '@cf/meta/llama-3-8b-instruct',        name: 'Llama 3 8B Instruct' },
  { id: '@cf/meta/llama-3-70b-instruct',       name: 'Llama 3 70B Instruct' },
  { id: '@cf/mistral/mistral-7b-instruct-v0.1', name: 'Mistral 7B Instruct' },
  { id: '@cf/google/gemma-7b-it',              name: 'Gemma 7B IT' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'chat' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/completions', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { messages, model: reqModel, max_tokens = 512, temperature = 0.7 } = body;

  if (!Array.isArray(messages) || messages.length === 0)
    return err(c, 'messages must be a non-empty array');

  if (reqModel !== undefined && !MODEL_IDS.includes(reqModel))
    return err(c, 'Unsupported or invalid model');

  const model  = reqModel || '@cf/meta/llama-3-8b-instruct';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  if (isMock) {
    return ok(c, {
      message: { role: 'assistant', content: '[Mock] Hello from FIAPI Chat!' },
      model, usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 }
    });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const res = await c.env.AI.run(model, { messages, max_tokens, temperature });
    return ok(c, {
      message: { role: 'assistant', content: res.response },
      model, usage: res.usage || {}
    });
  } catch (e) {
    return err(c, `Chat completion failed: ${e.message}`, 500);
  }
});

router.options('/completions', () => noContent());
router.all('/completions',     (c) => notAllowed(c));

export default router;
