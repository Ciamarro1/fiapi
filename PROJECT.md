# Project: FIAPI

## Architecture
FIAPI (Workers AI Image API with Agent Governance Council):
- **Agent Governance Council**: Implementation of CIA and CTO agents using `@ag-kit/agents`. Debates and designs cognitive & technical systems before API execution.
- **Cloudflare Worker Core**: `src/index.js`, routers, middleware.
- **Image Generation API**: `/v1/images/generate` endpoint integrated with Cloudflare Workers AI bindings (Flux, SDXL, etc.), supporting Bearer token authorization, rate limiting, and structured JSON responses.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Governance Setup | Implement CIA/CTO agents and governance script in src/agents/ & execute debate | none | DONE |
| 2 | M2: E2E Test Suite | Build E2E test harness and Tier 1-4 test cases for the API endpoints | none | IN_PROGRESS |
| 3 | M3: Worker Skeleton | Core Wrangler worker setup (index, router structure, health endpoint, basic docs) | none | IN_PROGRESS |
| 4 | M4: Auth and Limits | Implement bearer token auth and rate limiting middleware | M3 | PLANNED |
| 5 | M5: Cloudflare Workers AI Image Generation | Implement Cloudflare Worker AI image generation endpoints and error handling | M4 | PLANNED |
| 6 | M6: Integration & E2E Validation | Pass 100% of E2E tests (Tier 1-4) | M1, M2, M5 | PLANNED |
| 7 | M7: Adversarial Hardening (Tier 5) | White-box analysis and generated adversarial testing | M6 | PLANNED |

## Interface Contracts
### API Endpoints
- `GET /health` -> JSON: `{"status": "ok"}`
- `GET /v1/models` -> JSON listing models (e.g. `@cf/bytedance/stable-diffusion-xl-lightning`, `@cf/black-forest-labs/flux-1-schnell` etc.)
- `POST /v1/images/generate` -> Generates an image. Headers: `Authorization: Bearer <token>`, Body: JSON with `prompt`, returns JSON with base64 data.
- `GET /docs` -> OpenAPI documentation or simple API documentation page.

### Agent Governance Outputs
- Debate log and final design markdown files exported to `docs/` folder (e.g. `docs/architecture.md`).

## Code Layout
- `src/index.js`: Main worker entrypoint.
- `src/agents/gov.js` or `src/agents/debate.js`: The governance orchestration script.
- `src/agents/cia.js`: CIA agent definition.
- `src/agents/cto.js`: CTO agent definition.
- `docs/`: Governance outputs.
- `test/` or `tests/`: End-to-end tests.
- `package.json`: Node dependencies and scripts.
- `wrangler.json` (or `wrangler.toml`): Cloudflare Wrangler config.
