import { Hono } from 'hono';

const router = new Hono();

router.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
  <head>
    <title>FIAPI Documentation</title>
    <style>
      body { font-family: sans-serif; line-height: 1.6; margin: 40px auto; max-width: 650px; padding: 0 10px; color: #333; }
      h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
      code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>FIAPI - Cloudflare Workers AI Image API</h1>
    <p>Welcome to FIAPI. Below is the API reference documentation.</p>
    
    <h2>Endpoints</h2>
    
    <h3>GET /health</h3>
    <p>Checks the API health status.</p>
    <pre><code>GET /health</code></pre>
    <p>Response:</p>
    <pre><code>{ "status": "ok" }</code></pre>
    
    <h3>GET /v1/models</h3>
    <p>List available image generation models.</p>
    <pre><code>GET /v1/models</code></pre>
    
    <h3>POST /v1/images/generate</h3>
    <p>Generates an image from a prompt. Requires Bearer Token authentication.</p>
    <pre><code>POST /v1/images/generate
Authorization: Bearer &lt;token&gt;
Content-Type: application/json

{
  "prompt": "a futuristic city",
  "model": "@cf/black-forest-labs/flux-1-schnell"
}</code></pre>
    <p>Response:</p>
    <pre><code>{
  "success": true,
  "data": {
    "image": "base64...",
    "metadata": {
      "prompt": "a futuristic city",
      "model": "@cf/black-forest-labs/flux-1-schnell",
      "seed": 12345,
      "timestamp": "2026-06-27T04:49:11Z"
    }
  }
}</code></pre>
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
