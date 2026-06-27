# Original User Request

## 2026-06-27T07:37:35Z

# Teamwork Project Prompt — Draft

Build FIAPI, a Cloudflare Workers AI-based "OpenAI-like" Image API, featuring an embedded Agent Governance Council (CIA and CTO agents) using @ag-kit/agents to debate and design the system's cognitive and technical architecture before API execution.

Working directory: `c:\Users\WDAGUtilityAccount\Downloads\fiapi`
Integrity mode: development

## Requirements

### R1. Agent Governance Infrastructure
Implement the CIA and CTO meta-agents in `src/agents/` using `@ag-kit/agents`. They must use the provided metaprompts, establish memory and skill structures based on Lyzer Edge standards, and communicate in a 20-iteration workflow script to output architectural markdown files. Use Cloudflare AI as the LLM provider for the agents (if supported by AG-Kit, otherwise fallback appropriately).

### R2. Cloudflare Worker Image API
Build a modular Cloudflare Worker project (`src/index.js`, routers, middleware) that exposes endpoints like `/v1/images/generate`, `/v1/models`, `/health`, and `/docs`.

### R3. API Implementation
The API must use Cloudflare Workers AI bindings to generate images (e.g., Flux, SDXL), support Bearer token authentication, rate limiting architecture, and structured JSON responses.

## Acceptance Criteria

### Verification
- [ ] Running the governance workflow script successfully executes a multi-turn conversation between CIA and CTO without crashing.
- [ ] The governance workflow outputs architecture markdown documents to a designated docs folder.
- [ ] Running `npm run dev` (Wrangler) starts the Cloudflare Worker successfully.
- [ ] Sending a POST request to `/v1/images/generate` with valid auth returns a generated image.
- [ ] Sending a GET request to `/health` returns a 200 OK JSON status.
