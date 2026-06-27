import { Hono } from 'hono';
import { encodeBase64 } from '../utils/base64.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';

const router = new Hono();

const allowedModels = [
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0'
];

// List models
router.get('/models', (c) => {
  return c.json({
    success: true,
    models: [
      {
        id: '@cf/black-forest-labs/flux-1-schnell',
        name: 'Flux 1 Schnell'
      },
      {
        id: '@cf/bytedance/stable-diffusion-xl-lightning',
        name: 'Stable Diffusion XL Lightning'
      },
      {
        id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Stable Diffusion XL Base 1.0'
      }
    ]
  });
});

router.options('/models', (c) => {
  return new Response(null, { status: 204 });
});

router.all('/models', (c) => {
  return c.text('Method Not Allowed', 405);
});

// Generate image endpoint
router.post('/images/generate', authMiddleware, rateLimitMiddleware, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ success: false, error: 'Invalid JSON request body' }, 400);
  }

  // Handle case where body is not an object (e.g. array, number, null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ success: false, error: 'Invalid request body structure' }, 400);
  }

  const { prompt, model: reqModel, seed: reqSeed } = body;

  // Prompt validation
  if (prompt === undefined || prompt === null) {
    return c.json({ success: false, error: 'Prompt is required' }, 400);
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return c.json({ success: false, error: 'Prompt must be a non-empty string' }, 400);
  }
  if (prompt.length > 1000) {
    return c.json({ success: false, error: 'Prompt exceeds maximum length of 1000 characters' }, 400);
  }

  // Model validation
  if (reqModel !== undefined) {
    if (typeof reqModel !== 'string' || !allowedModels.includes(reqModel)) {
      return c.json({ success: false, error: 'Unsupported or invalid model' }, 400);
    }
  }
  const model = reqModel || '@cf/black-forest-labs/flux-1-schnell';

  // Seed validation
  if (reqSeed !== undefined) {
    if (typeof reqSeed !== 'number' || !Number.isInteger(reqSeed)) {
      return c.json({ success: false, error: 'Seed must be an integer' }, 400);
    }
  }
  const seed = reqSeed !== undefined ? reqSeed : Math.floor(Math.random() * 1000000);
  const timestamp = new Date().toISOString();

  const isMock = c.env.MOCK_AI === true || c.env.MOCK_AI === 'true' || c.env.MOCK_AI === '1';

  if (isMock) {
    // 1x1 transparent PNG base64 string mock
    const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    return c.json({
      success: true,
      data: {
        image: mockImageBase64,
        metadata: {
          prompt,
          model,
          seed,
          timestamp
        }
      }
    });
  }

  // Real Workers AI Binding execution
  if (!c.env.AI) {
    return c.json({ success: false, error: 'AI binding is not configured in this environment' }, 500);
  }

  try {
    const inputs = { prompt };
    if (body.num_steps !== undefined) inputs.num_steps = body.num_steps;
    if (body.guidance_scale !== undefined) inputs.guidance_scale = body.guidance_scale;
    if (reqSeed !== undefined) inputs.seed = reqSeed;

    const response = await c.env.AI.run(model, inputs);

    let imageBuffer;
    if (response instanceof Response) {
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = new Uint8Array(arrayBuffer);
    } else if (response instanceof ReadableStream) {
      const reader = response.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      let totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      imageBuffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        imageBuffer.set(chunk, offset);
        offset += chunk.length;
      }
    } else if (response instanceof ArrayBuffer) {
      imageBuffer = new Uint8Array(response);
    } else if (response && response.buffer) {
      imageBuffer = new Uint8Array(response.buffer);
    } else if (typeof response === 'string') {
      imageBuffer = response;
    } else {
      const arrayBuffer = await new Response(response).arrayBuffer();
      imageBuffer = new Uint8Array(arrayBuffer);
    }

    let base64Image;
    if (typeof imageBuffer === 'string') {
      base64Image = imageBuffer;
    } else {
      base64Image = encodeBase64(imageBuffer);
    }

    return c.json({
      success: true,
      data: {
        image: base64Image,
        metadata: {
          prompt,
          model,
          seed,
          timestamp
        }
      }
    });
  } catch (err) {
    return c.json({ success: false, error: `AI generation failed: ${err.message || err}` }, 500);
  }
});

router.options('/images/generate', (c) => {
  return new Response(null, { status: 204 });
});

router.all('/images/generate', (c) => {
  return c.text('Method Not Allowed', 405);
});

export default router;
