import { Hono } from 'hono';
import healthRouter     from './routers/health.js';
import docsRouter       from './routers/docs.js';
import imagesRouter     from './routers/images.js';
import chatRouter       from './routers/chat.js';
import embeddingsRouter from './routers/embeddings.js';
import visionRouter     from './routers/vision.js';
import audioRouter      from './routers/audio.js';
import videoRouter      from './routers/video.js';
import marketRouter     from './routers/market.js';
import agentRouter      from './routers/agent.js';

const app = new Hono();

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${err.stack || err}`);
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

// Global 404 Handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

// ─── Platform Routes ──────────────────────────────────────────────────────────
app.route('/health',           healthRouter);
app.route('/docs',             docsRouter);

// fiapi-image-api
app.route('/v1/images',        imagesRouter);

// fiapi-chat-api
app.route('/v1/chat',          chatRouter);

// fiapi-embedding-api
app.route('/v1/embeddings',    embeddingsRouter);

// fiapi-vision-api
app.route('/v1/vision',        visionRouter);

// fiapi-audio-api
app.route('/v1/audio',         audioRouter);

// fiapi-video-api
app.route('/v1/video',         videoRouter);

// fiapi-market-api
app.route('/v1/market',        marketRouter);

// fiapi-agent-api
app.route('/v1/agent',         agentRouter);

// Global models endpoint
app.get('/v1/models', (c) => {
  return c.json({
    success: true,
    models: [
      { id: '@cf/black-forest-labs/flux-1-schnell',         name: 'Flux 1 Schnell' },
      { id: '@cf/bytedance/stable-diffusion-xl-lightning',  name: 'Stable Diffusion XL Lightning' },
      { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL Base 1.0' },
      { id: '@cf/meta/llama-3-8b-instruct',        name: 'Llama 3 8B Instruct' },
      { id: '@cf/meta/llama-3-70b-instruct',       name: 'Llama 3 70B Instruct' },
      { id: '@cf/mistral/mistral-7b-instruct-v0.1', name: 'Mistral 7B Instruct' },
      { id: '@cf/google/gemma-7b-it',              name: 'Gemma 7B IT' },
      { id: '@cf/baai/bge-base-en-v1.5',       name: 'BGE Base EN v1.5' },
      { id: '@cf/baai/bge-large-en-v1.5',      name: 'BGE Large EN v1.5' },
      { id: '@cf/baai/bge-small-en-v1.5',      name: 'BGE Small EN v1.5' },
      { id: '@cf/openai/whisper',            name: 'Whisper (ASR)' },
      { id: '@cf/openai/whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo' },
      { id: '@cf/llava-hf/llava-1.5-7b-hf', name: 'LLaVA 1.5 7B' },
      { id: '@cf/unum/uform-gen2-qwen-500m', name: 'UForm Gen2 Qwen 500M' }
    ]
  });
});

// Platform root — list all domains
app.get('/v1', (c) => {
  return c.json({
    success: true,
    platform: 'FIAPI AI Platform',
    version: '2.0.0',
    domains: [
      { domain: 'fiapi-image-api',     base: '/v1/images',     endpoints: ['/models', '/generate'] },
      { domain: 'fiapi-chat-api',      base: '/v1/chat',       endpoints: ['/models', '/completions'] },
      { domain: 'fiapi-embedding-api', base: '/v1/embeddings', endpoints: ['/models', '/create'] },
      { domain: 'fiapi-vision-api',    base: '/v1/vision',     endpoints: ['/models', '/analyze'] },
      { domain: 'fiapi-audio-api',     base: '/v1/audio',      endpoints: ['/models', '/transcribe'] },
      { domain: 'fiapi-video-api',     base: '/v1/video',      endpoints: ['/models', '/generate'] },
      { domain: 'fiapi-market-api',    base: '/v1/market',     endpoints: ['/models', '/analyze'] },
      { domain: 'fiapi-agent-api',     base: '/v1/agent',      endpoints: ['/models', '/run'] },
    ],
    docs: '/docs',
    health: '/health',
  });
});

export default app;
