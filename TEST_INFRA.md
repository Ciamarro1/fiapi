# FIAPI Test Infrastructure

This document outlines the testing methodology, environment configuration, execution flow, and test tiers for the FIAPI (Workers AI Image API) End-to-End (E2E) test suite.

## 1. Testing Philosophy & Methodology

The E2E test suite for FIAPI is designed to be **fully black-box** and **requirement-driven**. It makes HTTP requests to a running instance of the worker on `localhost:8787` and verifies the behavior based strictly on the API specifications.

Key design principles:
- **No Internal Mocking**: The test suite does not mock internal Node.js modules or route handlers. It tests the compiled worker running inside wrangler dev.
- **Mock AI Simulation**: By running the worker with `MOCK_AI=true`, the worker bypasses actual external Workers AI remote calls (which require Cloudflare credentials and network access) and instead generates a local, deterministic, and valid 1x1 base64 transparent PNG. This allows full offline verification.
- **Zero Third-party Runner Dependencies**: The test suite uses Node's global `fetch` (standard in Node 18+) and a lightweight custom assertion/test harness. This guarantees high reliability, quick startup, and zero dependency issues under strict offline environments.

---

## 2. Test Execution Flow

The test cycle is managed entirely by `tests/e2e/runner.js`.

1. **Pre-requisites**: Detects the host OS (e.g. Windows vs. POSIX) and prepares the PATH and command invocation (`npx.cmd` vs `npx`).
2. **Environment Simulation**: Spawns `npx wrangler dev` with:
   - `MOCK_AI=true` (forces mock image generation).
   - `AUTH_TOKEN=test-token` (defines the secret token).
   - `WRANGLER_SEND_METRICS=false` & `CI=true` (disables interactive telemetry prompts).
3. **Liveness Polling**: Periodically polls `GET http://localhost:8787/health` up to 30 seconds.
4. **Test Run**: Spawns `node tests/e2e/e2e.test.js` once the server returns `{"status": "ok"}`.
5. **Teardown**: Gracefully terminates the dev server (using `taskkill` on Windows to kill the process tree, or `SIGTERM` on Unix) and returns the test suite's exit code.

---

## 3. Mapping Features to Test Tiers

The test suite consists of **76 test cases** divided across 4 distinct tiers:

### Tier 1: Feature Coverage (33 Test Cases)
Verifies happy-path conditions for all endpoints:
- **Health Check (`GET /health`)**: Verifies 200 OK, JSON content-type, correct body, and method restrictions (405 for POST/PUT).
- **Docs (`GET /docs`)**: Verifies 200 OK, HTML content-type, presence of key page documentation titles and endpoint routes.
- **Models Listing (`GET /v1/models`)**: Verifies 200 OK, returns correct JSON structure, and contains all supported text-to-image models (`flux-1-schnell`, `stable-diffusion-xl-lightning`, `stable-diffusion-xl-base-1.0`).
- **Happy Path Image Generation (`POST /v1/images/generate`)**: Verifies that requests with valid auth succeed, return expected base64 format, correctly fall back to default models, support custom seeds, emojis, special characters, and multiline prompts.

### Tier 2: Boundary & Corner Cases (31 Test Cases)
Verifies system input sanitation and error resilience:
- **Missing Fields**: Empty object `{}`, request with only `model` or only `seed` missing the prompt.
- **Empty Values**: Prompt is empty string `""`, contains only spaces, or only tabs.
- **Invalid Types**: Prompt/model/seed is a number, boolean, array, object, null, or decimal (seed).
- **Invalid Models**: Requesting unsupported models or invalid model identifiers.
- **Prompt Length Boundaries**: Exactly 1000 characters (succeeds) vs. 1001 characters (rejected with 400 Bad Request).
- **Request Body Malformations**: Invalid JSON syntax, empty body, body represents array/string/number instead of object.

### Tier 3: Combinatorial Cases (7 Test Cases)
Verifies various request headers and authentication combinations:
- **Authentication Variations**:
  - Missing `Authorization` header entirely.
  - Header without the required `Bearer ` prefix.
  - Case-insensitive prefixes: `bearer test-token` and `BEARER test-token` (must succeed).
  - Prefix with multiple spaces: `Bearer       test-token`.
  - Wrong/invalid authentication token.
- **Rate Limiting exhaustion**: Uses a dedicated rate-limit token (`rate-limit-token`) configured for a low limit (3 requests per 10s). The 4th request must return a 429 status code, `Retry-After` header, and rate limit tracking headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).

### Tier 4: Real-world Application Scenarios (5 Test Cases)
Simulates real application environments:
- **Sequential Requests**: 3 successive requests executed one after another to verify independent processing.
- **Parallel Requests**: 5 concurrent requests executed simultaneously to test server stability and race conditions.
- **Rate Limit Reset Cycle**: Exhausts the rate limit (gets a 429), waits for the specified `Retry-After` duration, and verifies that subsequent requests succeed again.
- **Base64 Format Verification**: Decodes the returned base64 string and validates that the byte header matches the official PNG signature (`89 50 4E 47 0D 0A 1A 0A`).
- **Custom Client Headers**: Sends extra metadata headers alongside valid auth (e.g. `User-Agent`, `X-Client-Version`) to verify the server handles arbitrary client headers.
