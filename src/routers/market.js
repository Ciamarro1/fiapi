import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, parseBody } from '../utils/platform.js';

const router = new Hono();

// Market analysis endpoints for the Lyzer Labs trading ecosystem.
// Provides AI-powered signal analysis, sentiment scoring, and market commentary
// using LLMs from Workers AI as the reasoning engine.

const MODELS = [
  { id: '@cf/meta/llama-3-8b-instruct', name: 'Llama 3 8B (Market Analysis)' },
];

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'market' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/analyze', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { symbol, context, task = 'sentiment', model: reqModel } = body;

  if (!symbol || typeof symbol !== 'string' || symbol.trim() === '')
    return err(c, 'symbol is required (e.g. "BTCUSD", "AAPL")');
  if (!context || typeof context !== 'string' || context.trim() === '')
    return err(c, 'context is required (e.g. recent news, price action summary)');

  const model  = reqModel || '@cf/meta/llama-3-8b-instruct';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  const systemPrompt = `You are a quantitative market intelligence analyst for Lyzer Labs.
Analyze the provided context for ${symbol} and produce a structured ${task} report.
Output in JSON: { "signal": "bullish|bearish|neutral", "confidence": 0-100, "summary": "...", "reasoning": "..." }`;

  if (isMock) {
    return ok(c, {
      symbol, task, model,
      analysis: { signal: 'neutral', confidence: 55, summary: '[Mock] Market appears range-bound.', reasoning: '[Mock] Insufficient volatility detected.' }
    });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const res = await c.env.AI.run(model, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Symbol: ${symbol}\nContext: ${context}` }
      ],
      max_tokens: 512
    });
    let analysis;
    try { analysis = JSON.parse(res.response); } catch { analysis = { raw: res.response }; }
    return ok(c, { symbol, task, model, analysis });
  } catch (e) {
    return err(c, `Market analysis failed: ${e.message}`, 500);
  }
});

router.options('/analyze', () => noContent());
router.all('/analyze',     (c) => notAllowed(c));

export default router;
