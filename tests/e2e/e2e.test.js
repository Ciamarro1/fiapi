const assert = require('assert');

const BASE_URL = 'http://localhost:8787';
const VALID_TOKEN = 'test-token';
const RATE_LIMIT_TOKEN = 'rate-limit-token';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// ==========================================
// TIER 1: FEATURE COVERAGE (33 test cases)
// ==========================================

// GET /health tests
test('Tier 1: health_ok_status - GET /health returns 200', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(res.status, 200);
});

test('Tier 1: health_ok_body - GET /health returns {"status":"ok"}', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  const body = await res.json();
  assert.deepStrictEqual(body, { status: 'ok' });
});

test('Tier 1: health_no_auth - GET /health does not require auth', async () => {
  const res = await fetch(`${BASE_URL}/health`, {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.status, 'ok');
});

test('Tier 1: health_method_not_allowed_post - POST /health returns 405', async () => {
  const res = await fetch(`${BASE_URL}/health`, { method: 'POST' });
  assert.strictEqual(res.status, 405);
});

test('Tier 1: health_method_not_allowed_put - PUT /health returns 405', async () => {
  const res = await fetch(`${BASE_URL}/health`, { method: 'PUT' });
  assert.strictEqual(res.status, 405);
});

test('Tier 1: health_headers_content_type - GET /health returns application/json content-type', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.ok(res.headers.get('Content-Type').includes('application/json'));
});

test('Tier 1: health_options - OPTIONS /health returns 204', async () => {
  const res = await fetch(`${BASE_URL}/health`, { method: 'OPTIONS' });
  assert.strictEqual(res.status, 204);
});

// GET /docs tests
test('Tier 1: docs_status - GET /docs returns 200', async () => {
  const res = await fetch(`${BASE_URL}/docs`);
  assert.strictEqual(res.status, 200);
});

test('Tier 1: docs_content_type - GET /docs returns text/html', async () => {
  const res = await fetch(`${BASE_URL}/docs`);
  assert.ok(res.headers.get('Content-Type').includes('text/html'));
});

test('Tier 1: docs_body_contains_title - GET /docs HTML body contains "FIAPI Documentation"', async () => {
  const res = await fetch(`${BASE_URL}/docs`);
  const body = await res.text();
  assert.ok(body.includes('FIAPI Documentation'));
});

test('Tier 1: docs_body_contains_endpoints - GET /docs HTML body contains generate endpoint', async () => {
  const res = await fetch(`${BASE_URL}/docs`);
  const body = await res.text();
  assert.ok(body.includes('/v1/images/generate'));
});

test('Tier 1: docs_method_not_allowed_post - POST /docs returns 405', async () => {
  const res = await fetch(`${BASE_URL}/docs`, { method: 'POST' });
  assert.strictEqual(res.status, 405);
});

test('Tier 1: docs_method_not_allowed_delete - DELETE /docs returns 405', async () => {
  const res = await fetch(`${BASE_URL}/docs`, { method: 'DELETE' });
  assert.strictEqual(res.status, 405);
});

test('Tier 1: docs_options - OPTIONS /docs returns 204', async () => {
  const res = await fetch(`${BASE_URL}/docs`, { method: 'OPTIONS' });
  assert.strictEqual(res.status, 204);
});

// GET /v1/models tests
test('Tier 1: models_status - GET /v1/models returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  assert.strictEqual(res.status, 200);
});

test('Tier 1: models_content_type - GET /v1/models returns application/json', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  assert.ok(res.headers.get('Content-Type').includes('application/json'));
});

test('Tier 1: models_body_success - GET /v1/models has success: true', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  const body = await res.json();
  assert.strictEqual(body.success, true);
});

test('Tier 1: models_body_list - GET /v1/models contains models array', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  const body = await res.json();
  assert.ok(Array.isArray(body.models));
});

test('Tier 1: models_contains_flux - GET /v1/models contains flux-1-schnell model', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  const body = await res.json();
  const hasFlux = body.models.some(m => m.id === '@cf/black-forest-labs/flux-1-schnell');
  assert.ok(hasFlux);
});

test('Tier 1: models_contains_lightning - GET /v1/models contains stable-diffusion-xl-lightning model', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`);
  const body = await res.json();
  const hasLightning = body.models.some(m => m.id === '@cf/bytedance/stable-diffusion-xl-lightning');
  assert.ok(hasLightning);
});

test('Tier 1: models_method_not_allowed_post - POST /v1/models returns 405', async () => {
  const res = await fetch(`${BASE_URL}/v1/models`, { method: 'POST' });
  assert.strictEqual(res.status, 405);
});

// POST /v1/images/generate happy path tests
test('Tier 1: generate_happy_default_model - Generate with default model returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'a beautiful view of snowy mountains' })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(body.data.image);
  assert.strictEqual(body.data.metadata.model, '@cf/black-forest-labs/flux-1-schnell');
});

test('Tier 1: generate_happy_flux - Generate with flux model returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'cyberpunk hacker room',
      model: '@cf/black-forest-labs/flux-1-schnell'
    })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.metadata.model, '@cf/black-forest-labs/flux-1-schnell');
});

test('Tier 1: generate_happy_lightning - Generate with lightning model returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'neon city street at night',
      model: '@cf/bytedance/stable-diffusion-xl-lightning'
    })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.metadata.model, '@cf/bytedance/stable-diffusion-xl-lightning');
});

test('Tier 1: generate_happy_stability - Generate with stability model returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'retro futuristic space station',
      model: '@cf/stabilityai/stable-diffusion-xl-base-1.0'
    })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.metadata.model, '@cf/stabilityai/stable-diffusion-xl-base-1.0');
});

test('Tier 1: generate_happy_with_seed - Generate with custom seed returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'steampunk airship in the clouds',
      seed: 99999
    })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.data.metadata.seed, 99999);
});

test('Tier 1: generate_happy_prompt_emoji - Generate with emoji prompt returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: '🚀🌕🐱' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 1: generate_happy_prompt_special_chars - Generate with special chars prompt returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'What if? (a + b) * c = "image"! @#%^&*()' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 1: generate_happy_prompt_multiline - Generate with multiline prompt returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'Line 1\nLine 2\nLine 3' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 1: generate_happy_headers_check - Response returns application/json Content-Type', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'valid prompt' })
  });
  assert.ok(res.headers.get('Content-Type').includes('application/json'));
});

test('Tier 1: generate_happy_response_success - Response success is true', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'valid prompt' })
  });
  const body = await res.json();
  assert.strictEqual(body.success, true);
});

test('Tier 1: generate_happy_response_metadata_prompt - Metadata prompt matches input prompt', async () => {
  const prompt = 'matching prompt test';
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  const body = await res.json();
  assert.strictEqual(body.data.metadata.prompt, prompt);
});

test('Tier 1: generate_happy_response_metadata_timestamp - Metadata contains timestamp', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: 'timestamp test' })
  });
  const body = await res.json();
  const timestamp = body.data.metadata.timestamp;
  assert.ok(timestamp);
  assert.ok(!isNaN(Date.parse(timestamp)));
});


// ==========================================
// TIER 2: BOUNDARY & CORNER CASES (31 test cases)
// ==========================================

// Missing prompt fields
test('Tier 2: generate_boundary_missing_prompt_empty_obj - Empty object returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_missing_prompt_only_model - Object with only model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: '@cf/black-forest-labs/flux-1-schnell' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_missing_prompt_only_seed - Object with only seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed: 12345 })
  });
  assert.strictEqual(res.status, 400);
});

// Empty prompt values
test('Tier 2: generate_boundary_prompt_empty_string - Empty string prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_spaces - Whitespace prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '   ' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_tabs - Tab prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '\t\t' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_null - Null prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: null })
  });
  assert.strictEqual(res.status, 400);
});

// Invalid prompt types
test('Tier 2: generate_boundary_prompt_number - Number prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 12345 })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_boolean - Boolean prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: true })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_array - Array prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: ['hello'] })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_object - Object prompt returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: { text: 'hello' } })
  });
  assert.strictEqual(res.status, 400);
});

// Invalid models
test('Tier 2: generate_boundary_model_unsupported - Unsupported model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', model: 'not-a-supported-model' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_model_empty - Empty model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', model: '' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_model_number - Number model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', model: 12345 })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_model_boolean - Boolean model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', model: false })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_model_null - Null model returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', model: null })
  });
  assert.strictEqual(res.status, 400);
});

// Invalid seeds
test('Tier 2: generate_boundary_seed_string - String seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', seed: '123' })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_seed_boolean - Boolean seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', seed: true })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_seed_null - Null seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', seed: null })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_seed_decimal - Decimal seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', seed: 12.34 })
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_seed_array - Array seed returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test', seed: [123] })
  });
  assert.strictEqual(res.status, 400);
});

// Overflow prompt strings
test('Tier 2: generate_boundary_prompt_overflow - Prompt length 1001 returns 400', async () => {
  const longPrompt = 'a'.repeat(1001);
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: longPrompt })
  });
  assert.strictEqual(res.status, 400);
});

// Request body variations
test('Tier 2: generate_boundary_body_not_json_syntax - Invalid JSON syntax returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: '{invalid-json'
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_body_empty - Empty body returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: ''
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_body_null - Body representing null returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: 'null'
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_body_array - Body representing array returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['prompt', 'valid'])
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_body_string - Body representing string returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify('prompt')
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_body_number - Body representing number returns 400', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(12345)
  });
  assert.strictEqual(res.status, 400);
});

test('Tier 2: generate_boundary_prompt_exactly_1000 - Prompt length 1000 returns 200', async () => {
  const exactPrompt = 'a'.repeat(1000);
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: exactPrompt })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 2: generate_boundary_prompt_exactly_1001 - Prompt length 1001 returns 400', async () => {
  const exactPrompt = 'a'.repeat(1001);
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: exactPrompt })
  });
  assert.strictEqual(res.status, 400);
});


// ==========================================
// TIER 3: COMBINATORIAL CASES (7 test cases)
// ==========================================

test('Tier 3: generate_combinatorial_auth_missing - Missing auth header returns 401', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 401);
});

test('Tier 3: generate_combinatorial_auth_no_bearer_prefix - Auth header without Bearer prefix returns 401', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 401);
});

test('Tier 3: generate_combinatorial_auth_bearer_lowercase - bearer token lowercase prefix returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 3: generate_combinatorial_auth_bearer_uppercase - BEARER token uppercase prefix returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `BEARER ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 3: generate_combinatorial_auth_bearer_extra_spaces - Bearer with multiple spaces returns 200', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer       ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 200);
});

test('Tier 3: generate_combinatorial_auth_invalid_token - Invalid token returns 401', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer wrong-secret-key', 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' })
  });
  assert.strictEqual(res.status, 401);
});

test('Tier 3: generate_combinatorial_rate_limit_exhaustion - Rapid requests exhaust rate limit and return 429', async () => {
  // Use rate-limit-token which allows 3 requests per 10s. The 4th should fail with 429.
  const makeRequest = () => fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RATE_LIMIT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'rate limit test' })
  });

  const res1 = await makeRequest();
  const res2 = await makeRequest();
  const res3 = await makeRequest();
  const res4 = await makeRequest();

  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res3.status, 200);
  
  // The 4th request must be 429
  assert.strictEqual(res4.status, 429);
  
  // Verify rate limit headers on 429 response
  assert.strictEqual(res4.headers.get('X-RateLimit-Limit'), '3');
  assert.strictEqual(res4.headers.get('X-RateLimit-Remaining'), '0');
  assert.ok(res4.headers.get('X-RateLimit-Reset'));
  
  // Verify Retry-After header
  const retryAfter = res4.headers.get('Retry-After');
  assert.ok(retryAfter);
  assert.ok(parseInt(retryAfter, 10) > 0);
  
  // Verify body content
  const body = await res4.json();
  assert.strictEqual(body.success, false);
  assert.ok(body.error.includes('Rate limit exceeded'));
  assert.strictEqual(body.retryAfter, parseInt(retryAfter, 10));
});


// ==========================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 test cases)
// ==========================================

test('Tier 4: scenario_sequential_requests - Sequential successful generation requests', async () => {
  const prompts = ['sequential 1', 'sequential 2', 'sequential 3'];
  for (const prompt of prompts) {
    const res = await fetch(`${BASE_URL}/v1/images/generate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.metadata.prompt, prompt);
  }
});

test('Tier 4: scenario_parallel_requests - Parallel generation requests succeed', async () => {
  const prompts = ['parallel 1', 'parallel 2', 'parallel 3', 'parallel 4', 'parallel 5'];
  const promises = prompts.map(prompt => 
    fetch(`${BASE_URL}/v1/images/generate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
  );
  
  const responses = await Promise.all(promises);
  for (let i = 0; i < responses.length; i++) {
    assert.strictEqual(responses[i].status, 200);
    const body = await responses[i].json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.metadata.prompt, prompts[i]);
  }
});

test('Tier 4: scenario_rate_limit_reset_cycle - Rate limit exhaustion resets after delay', async () => {
  // We already exhausted rate-limit-token in Tier 3, or we exhaust it here again.
  // Let's exhaust it again to make sure of the state.
  const makeRequest = () => fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RATE_LIMIT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'reset test' })
  });

  // Keep sending requests until we get 429
  let isExhausted = false;
  let retryAfterSeconds = 0;
  for (let i = 0; i < 10; i++) {
    const res = await makeRequest();
    if (res.status === 429) {
      isExhausted = true;
      retryAfterSeconds = parseInt(res.headers.get('Retry-After'), 10);
      break;
    }
  }
  
  assert.ok(isExhausted, 'Should have exhausted the rate limit');
  assert.ok(retryAfterSeconds > 0);
  
  // Wait for retryAfterSeconds + 1s to guarantee reset
  console.log(`Waiting ${retryAfterSeconds + 1}s for rate limit to reset...`);
  await new Promise(resolve => setTimeout(resolve, (retryAfterSeconds + 1) * 1000));
  
  // Post-reset request should succeed
  const resPost = await makeRequest();
  assert.strictEqual(resPost.status, 200);
  const bodyPost = await resPost.json();
  assert.strictEqual(bodyPost.success, true);
});

test('Tier 4: scenario_base64_format_verification - Response contains valid base64 image data (PNG format)', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${VALID_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'base64 verification' })
  });
  
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  const base64Str = body.data.image;
  
  // Check it is a non-empty string
  assert.strictEqual(typeof base64Str, 'string');
  assert.ok(base64Str.length > 0);
  
  // Decode base64 and verify PNG signature
  const buffer = Buffer.from(base64Str, 'base64');
  assert.ok(buffer.length > 8);
  
  // First 8 bytes of PNG format: 137 80 78 71 13 10 26 10
  assert.strictEqual(buffer[0], 137);
  assert.strictEqual(buffer[1], 80);  // P
  assert.strictEqual(buffer[2], 78);  // N
  assert.strictEqual(buffer[3], 71);  // G
  assert.strictEqual(buffer[4], 13);
  assert.strictEqual(buffer[5], 10);
  assert.strictEqual(buffer[6], 26);
  assert.strictEqual(buffer[7], 10);
});

test('Tier 4: scenario_custom_client_headers - Request with custom client headers succeeds', async () => {
  const res = await fetch(`${BASE_URL}/v1/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VALID_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'FIAPI-E2E-Tester/1.0',
      'X-Client-Version': '2.0.4',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ prompt: 'custom headers test' })
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
});


// ==========================================
// RUNNER ENTRYPOINT
// ==========================================

async function runAll() {
  let passedCount = 0;
  let failedCount = 0;
  const failures = [];
  
  console.log(`\n========================================`);
  console.log(`Starting FIAPI E2E Test Suite (${tests.length} cases)`);
  console.log(`========================================\n`);
  
  for (let i = 0; i < tests.length; i++) {
    const { name, fn } = tests[i];
    try {
      await fn();
      passedCount++;
      console.log(`[\x1b[32mPASS\x1b[0m] [${i+1}/${tests.length}] ${name}`);
    } catch (err) {
      failedCount++;
      failures.push({ name, error: err });
      console.log(`[\x1b[31mFAIL\x1b[0m] [${i+1}/${tests.length}] ${name}`);
      console.error(err);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`E2E Execution Summary`);
  console.log(`========================================`);
  console.log(`Total tests run : ${tests.length}`);
  console.log(`Passed          : \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Failed          : \x1b[31m${failedCount}\x1b[0m`);
  console.log(`========================================\n`);
  
  if (failedCount > 0) {
    console.log(`\x1b[31mError: ${failedCount} test case(s) failed.\x1b[0m\n`);
    failures.forEach((f, idx) => {
      console.log(`${idx + 1}. \x1b[31m${f.name}\x1b[0m`);
      console.error(f.error.stack || f.error);
    });
    process.exit(1);
  } else {
    console.log(`\x1b[32mAll ${passedCount} tests passed successfully!\x1b[0m\n`);
    process.exit(0);
  }
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Unhandled rejection in test execution:', err);
    process.exit(1);
  });
}

module.exports = { runAll, tests };
