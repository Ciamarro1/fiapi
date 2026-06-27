import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, parseBody } from '../utils/platform.js';

const router = new Hono();

// Agent execution router — enables structured autonomous task execution
// using a CIA/CTO-inspired reasoning chain powered by Workers AI LLMs.

const MODELS = [
  { id: '@cf/meta/llama-3-8b-instruct',  name: 'Llama 3 8B (Agent)' },
  { id: '@cf/meta/llama-3-70b-instruct', name: 'Llama 3 70B (Agent)' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'agent' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/run', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { task, system_prompt, tools = [], model: reqModel, max_steps = 5 } = body;

  if (!task || typeof task !== 'string' || task.trim() === '')
    return err(c, 'task is required — describe what the agent should accomplish');

  if (reqModel !== undefined && !MODEL_IDS.includes(reqModel))
    return err(c, 'Unsupported or invalid model');

  const model  = reqModel || '@cf/meta/llama-3-8b-instruct';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  const defaultSystem = system_prompt ||
    `You are a Lyzer Labs AI Agent operating under Cognitive Governance protocols.
Execute the given task methodically. Think step-by-step. Produce a structured result.
Output JSON: { "result": "...", "steps": ["step1", "step2"], "confidence": 0-100 }`;

  if (isMock) {
    return ok(c, {
      task, model, max_steps,
      execution: {
        result: '[Mock] Task analyzed and completed by FIAPI Agent.',
        steps: ['[Mock] Step 1: Analyze task', '[Mock] Step 2: Formulate plan', '[Mock] Step 3: Execute'],
        confidence: 85
      }
    });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const res = await c.env.AI.run(model, {
      messages: [
        { role: 'system', content: defaultSystem },
        { role: 'user',   content: `Task: ${task}${tools.length ? `\nAvailable tools: ${tools.join(', ')}` : ''}` }
      ],
      max_tokens: 1024
    });
    let execution;
    try { execution = JSON.parse(res.response); } catch { execution = { result: res.response, steps: [], confidence: null }; }
    return ok(c, { task, model, max_steps, execution });
  } catch (e) {
    return err(c, `Agent execution failed: ${e.message}`, 500);
  }
});

router.options('/run', () => noContent());
router.all('/run',     (c) => notAllowed(c));

export default router;
