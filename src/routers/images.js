import { Hono } from 'hono';
import { encodeBase64 } from '../utils/base64.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { ok, err, notAllowed, noContent, requireString, parseBody } from '../utils/platform.js';

const router = new Hono();

const MODELS = [
  { id: '@cf/black-forest-labs/flux-1-schnell',         name: 'Flux 1 Schnell' },
  { id: '@cf/bytedance/stable-diffusion-xl-lightning',  name: 'Stable Diffusion XL Lightning' },
  { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL Base 1.0' },
];
const MODEL_IDS = MODELS.map(m => m.id);

router.get('/models',    (c) => ok(c, { models: MODELS, domain: 'images' }));
router.options('/models', () => noContent());
router.all('/models',    (c) => notAllowed(c));

router.post('/generate', authMiddleware, rateLimitMiddleware, async (c) => {
  const [body, bodyErr] = await parseBody(c);
  if (bodyErr) return bodyErr;

  const { prompt, model: reqModel, seed: reqSeed } = body;
  const promptErr = requireString(prompt, 'Prompt', 1000);
  if (promptErr) return err(c, promptErr);

  if (reqModel !== undefined && (typeof reqModel !== 'string' || !MODEL_IDS.includes(reqModel)))
    return err(c, 'Unsupported or invalid model');

  if (reqSeed !== undefined && (typeof reqSeed !== 'number' || !Number.isInteger(reqSeed)))
    return err(c, 'Seed must be an integer');

  const model     = reqModel  || '@cf/black-forest-labs/flux-1-schnell';
  const seed      = reqSeed   ?? Math.floor(Math.random() * 1_000_000);
  const isMock    = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';
  const kaggleUrl = c.env.KAGGLE_API_URL;

  if (kaggleUrl && !isMock) {
    try {
      const inputs = { prompt, seed };
      if (body.num_steps      !== undefined) inputs.num_steps      = body.num_steps;
      if (body.guidance_scale !== undefined) inputs.guidance_scale = body.guidance_scale;

      const headers = { 'Content-Type': 'application/json' };
      const authHeader = c.req.header('Authorization');
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(kaggleUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(inputs)
      });
      if (!response.ok) {
        return err(c, `Kaggle generation failed: ${response.statusText} (${response.status})`, 500);
      }
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const resData = await response.json();
        let base64Image;
        if (resData.image) {
          base64Image = resData.image;
        } else if (Array.isArray(resData.images) && resData.images.length > 0) {
          base64Image = resData.images[0];
        } else if (resData.data && resData.data.image) {
          base64Image = resData.data.image;
        }
        if (!base64Image) {
          return err(c, 'Kaggle response did not contain image data', 500);
        }
        if (base64Image.includes(';base64,')) {
          base64Image = base64Image.split(';base64,')[1];
        }
        return ok(c, { image: base64Image, metadata: { prompt, model, seed, timestamp: new Date().toISOString() } });
      } else {
        const buffer = await response.arrayBuffer();
        const base64Image = encodeBase64(new Uint8Array(buffer));
        return ok(c, { image: base64Image, metadata: { prompt, model, seed, timestamp: new Date().toISOString() } });
      }
    } catch (e) {
      return err(c, `Kaggle connection failed: ${e.message}`, 500);
    }
  }

  if (isMock) {
    const mock = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    return ok(c, { image: mock, metadata: { prompt, model, seed, timestamp: new Date().toISOString() } });
  }

  if (!c.env.AI) return err(c, 'AI binding not configured', 500);

  try {
    const inputs = { prompt, seed };
    if (body.num_steps      !== undefined) inputs.num_steps      = body.num_steps;
    if (body.guidance_scale !== undefined) inputs.guidance_scale = body.guidance_scale;

    const res    = await c.env.AI.run(model, inputs);
    const ab     = res instanceof Response ? await res.arrayBuffer()
                 : res instanceof ArrayBuffer ? res
                 : await new Response(res).arrayBuffer();
    const image  = encodeBase64(new Uint8Array(ab));
    return ok(c, { image, metadata: { prompt, model, seed, timestamp: new Date().toISOString() } });
  } catch (e) {
    return err(c, `Image generation failed: ${e.message}`, 500);
  }
});

router.options('/generate', () => noContent());
router.all('/generate',     (c) => notAllowed(c));

export default router;
