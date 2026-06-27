import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, parseBody } from '../utils/platform.js';

const router = new Hono();

const MODELS = [
  { id: '@cf/openai/whisper',            name: 'Whisper (ASR)' },
  { id: '@cf/openai/whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',     (c) => ok(c, { models: MODELS, domain: 'audio' }));
router.options('/models', () => noContent());
router.all('/models',     (c) => notAllowed(c));

router.post('/transcribe', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { audio, model: reqModel, language } = body;

  if (!audio || typeof audio !== 'string' || audio.trim() === '')
    return err(c, 'audio must be a base64-encoded audio string');

  if (reqModel !== undefined && !MODEL_IDS.includes(reqModel))
    return err(c, 'Unsupported or invalid model');

  const model  = reqModel || '@cf/openai/whisper';
  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  if (isMock) {
    return ok(c, {
      text: '[Mock] Transcribed audio from FIAPI Audio.',
      language: language || 'en', model
    });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const bin   = atob(audio.replace(/^data:[^;]+;base64,/, ''));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const inp   = { audio: [...bytes] };
    if (language) inp.language = language;

    const res = await c.env.AI.run(model, inp);
    return ok(c, { text: res.text, language: res.language || language || 'en', model });
  } catch (e) {
    return err(c, `Audio transcription failed: ${e.message}`, 500);
  }
});

router.options('/transcribe', () => noContent());
router.all('/transcribe',     (c) => notAllowed(c));

export default router;
