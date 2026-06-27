import { Hono } from 'hono';

const router = new Hono();

router.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
  <head>
    <title>FIAPI AI Platform Documentation</title>
    <style>
      body { font-family: sans-serif; line-height: 1.6; margin: 40px auto; max-width: 800px; padding: 0 10px; color: #333; }
      h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      h2 { margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
      code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 3px; }
      .endpoint { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    </style>
  </head>
  <body>
    <h1>FIAPI AI Platform - Unified AI API</h1>
    <p>Welcome to the FIAPI AI Platform. This platform provides a unified interface to various AI models via 8 domain-specific services.</p>
    
    <h2>Platform Endpoints</h2>
    <div class="endpoint">
      <h3>GET /health</h3>
      <p>Checks the API health status.</p>
      <pre><code>{ "status": "ok" }</code></pre>
    </div>
    <div class="endpoint">
      <h3>GET /v1</h3>
      <p>Discovers available services and endpoints.</p>
    </div>

    <h2>Domain Services</h2>
    <p>All operational endpoints require <code>Authorization: Bearer &lt;token&gt;</code> and <code>Content-Type: application/json</code>.</p>
    
    <h3>1. Images API</h3>
    <ul>
      <li><code>GET /v1/images/models</code> - List image models</li>
      <li><code>POST /v1/images/generate</code> - Generate an image from a text prompt</li>
    </ul>

    <h3>2. Chat API</h3>
    <ul>
      <li><code>GET /v1/chat/models</code> - List chat models</li>
      <li><code>POST /v1/chat/completions</code> - Generate a chat completion</li>
    </ul>

    <h3>3. Embeddings API</h3>
    <ul>
      <li><code>GET /v1/embeddings/models</code> - List embedding models</li>
      <li><code>POST /v1/embeddings/create</code> - Create text embeddings</li>
    </ul>

    <h3>4. Vision API</h3>
    <ul>
      <li><code>GET /v1/vision/models</code> - List vision models</li>
      <li><code>POST /v1/vision/analyze</code> - Analyze an image with a prompt</li>
    </ul>

    <h3>5. Audio API</h3>
    <ul>
      <li><code>GET /v1/audio/models</code> - List audio models</li>
      <li><code>POST /v1/audio/transcribe</code> - Transcribe audio to text</li>
    </ul>

    <h3>6. Video API (Preview)</h3>
    <ul>
      <li><code>GET /v1/video/models</code> - List video models</li>
      <li><code>POST /v1/video/generate</code> - Generate video (Stub)</li>
    </ul>

    <h3>7. Market API</h3>
    <ul>
      <li><code>GET /v1/market/models</code> - List market models</li>
      <li><code>POST /v1/market/analyze</code> - AI-powered market analysis and sentiment</li>
    </ul>

    <h3>8. Agent API</h3>
    <ul>
      <li><code>GET /v1/agent/models</code> - List agent models</li>
      <li><code>POST /v1/agent/run</code> - Structured autonomous task execution</li>
    </ul>

  </body>
</html>
  `);
});

router.options('/', (c) => {
  return new Response(null, { status: 204 });
});

router.all('/', (c) => {
  return c.text('Method Not Allowed', 405);
});

export default router;
