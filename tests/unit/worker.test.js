import { describe, it, expect, vi } from 'vitest';
import app from '../../src/index.js';

describe('FIAPI Workers Application', () => {
  const env = {
    AUTH_TOKEN: 'test-secret',
    MOCK_AI: 'true',
    RATE_LIMIT_MAX: '5',
    RATE_LIMIT_WINDOW: '60'
  };

  it('GET /health should return 200 and status ok', async () => {
    const res = await app.request('/health', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('GET /docs should return 200 and html documentation', async () => {
    const res = await app.request('/docs', {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('FIAPI');
  });

  it('GET /v1/models should return 200 and model list', async () => {
    const res = await app.request('/v1/models', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.models).toBeDefined();
    expect(body.models.length).toBeGreaterThan(0);
  });

  describe('POST /v1/images/generate Authentication', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      }, env);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Missing or invalid Authorization header');
    });

    it('should return 401 when Authorization header format is invalid', async () => {
      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'token test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'test' })
      }, env);
      expect(res.status).toBe(401);
    });

    it('should return 401 when Token is incorrect', async () => {
      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer wrong-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'test' })
      }, env);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid token');
    });
  });

  describe('POST /v1/images/generate Prompt Validation', () => {
    it('should return 400 when prompt is missing', async () => {
      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }, env);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Prompt is required');
    });
  });

  describe('POST /v1/images/generate Generation Logic', () => {
    it('should return mock 1x1 image when MOCK_AI=true', async () => {
      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'cute cat', model: '@cf/black-forest-labs/flux-1-schnell', seed: 42 })
      }, { ...env, MOCK_AI: 'true' });
      
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.image).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
      expect(body.data.metadata.prompt).toBe('cute cat');
      expect(body.data.metadata.model).toBe('@cf/black-forest-labs/flux-1-schnell');
      expect(body.data.metadata.seed).toBe(42);
      expect(body.data.metadata.timestamp).toBeDefined();
    });

    it('should invoke c.env.AI when MOCK_AI=false', async () => {
      const mockAI = {
        run: vi.fn().mockImplementation(async (model, inputs) => {
          return new Uint8Array([1, 2, 3]);
        })
      };

      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'realistic space station' })
      }, { ...env, MOCK_AI: 'false', AI: mockAI });

      expect(res.status).toBe(200);
      expect(mockAI.run).toHaveBeenCalledWith(
        '@cf/black-forest-labs/flux-1-schnell',
        expect.objectContaining({ prompt: 'realistic space station' })
      );

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.image).toBe('AQID');
    });

    it('should return 500 when AI binding fails', async () => {
      const mockAI = {
        run: vi.fn().mockImplementation(async () => {
          throw new Error('AI Service Unavailable');
        })
      };

      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'realistic space station' })
      }, { ...env, MOCK_AI: 'false', AI: mockAI });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('AI Service Unavailable');
    });

    it('should invoke Kaggle API when KAGGLE_API_URL is configured and MOCK_AI is false (JSON response)', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        return new Response(JSON.stringify({ image: 'dGVzdC1iYXNlNjQ=' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      });

      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'realistic space station' })
      }, { ...env, MOCK_AI: 'false', KAGGLE_API_URL: 'https://kaggle-endpoint.ngrok-free.dev', RATE_LIMIT_MAX: '20' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.image).toBe('dGVzdC1iYXNlNjQ=');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://kaggle-endpoint.ngrok-free.dev',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('realistic space station')
        })
      );

      mockFetch.mockRestore();
    });

    it('should invoke Kaggle API when KAGGLE_API_URL is configured and MOCK_AI is false (Binary response)', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        return new Response(new Uint8Array([10, 20, 30]), {
          status: 200,
          headers: { 'Content-Type': 'image/png' }
        });
      });

      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'realistic space station' })
      }, { ...env, MOCK_AI: 'false', KAGGLE_API_URL: 'https://kaggle-endpoint.ngrok-free.dev', RATE_LIMIT_MAX: '20' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.image).toBe('ChQe');

      mockFetch.mockRestore();
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should allow requests within limit and then return 429 when exceeded', async () => {
      const localEnv = {
        ...env,
        AUTH_TOKEN: 'rate-limit-secret',
        RATE_LIMIT_MAX: '2'
      };

      // Request 1: OK
      let res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer rate-limit-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'req1' })
      }, localEnv);
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('2');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('1');

      // Request 2: OK
      res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer rate-limit-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'req2' })
      }, localEnv);
      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');

      // Request 3: 429
      res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer rate-limit-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'req3' })
      }, localEnv);
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Rate limit exceeded');
    });

    it('should use KV namespace if provided', async () => {
      class MockKV {
        constructor() {
          this.store = new Map();
        }
        async get(key) {
          return this.store.has(key) ? this.store.get(key) : null;
        }
        async put(key, value, options) {
          this.store.set(key, value);
        }
      }

      const kv = new MockKV();
      const spyGet = vi.spyOn(kv, 'get');
      const spyPut = vi.spyOn(kv, 'put');

      const localEnv = {
        ...env,
        AUTH_TOKEN: 'kv-secret',
        RATE_LIMIT_KV: kv,
        RATE_LIMIT_MAX: '5'
      };

      const res = await app.request('/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer kv-secret',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: 'req KV' })
      }, localEnv);

      expect(res.status).toBe(200);
      expect(spyGet).toHaveBeenCalled();
      expect(spyPut).toHaveBeenCalled();
    });
  });
});
