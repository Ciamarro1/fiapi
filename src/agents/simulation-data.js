const CIA_RESPONSES = [
  `# 1. Observer Analysis
- Primary Observer: CIA (Governing cognition and meaning systems).
- Secondary Observers: CTO (Implementing technical systems), CEO (Business alignment), Quant Research (Consuming data), Compliance (Risk mitigation).

# 2. Semantic Map
- "FIAPI": Cloudflare Workers AI Image Generation API with Agent Governance Council.
- "Agent Governance Council": Cognitive-semantic feedback loop comprised of CIA and CTO.
- "Image Generation": Transition from semantic textual intent to high-fidelity visual representations.

# 3. Epistemic Map
- Verified Fact: Cloudflare Workers AI provides binding access to image generation models.
- Assumption: Llama-3-8b-instruct has sufficient reasoning capacity for real-time agent governance routing.
- Unknown: Maximum latency impact of real-time agent governance on HTTP requests.

# 4. Domain Ontology
- Concepts: Semantic Prompt, Visual Representation, Access Token, Rate Constraint, Model Binding.
- Relationships: Visual Representation is generated from Semantic Prompt using Model Binding under Access Token credentials subject to Rate Constraint.

# 5. Goal Architecture
- Core Objective: Establish stable meaning systems for image generation, preventing semantic drift in user requests.
- Success Criteria: Zero-ambiguity routing, strict separation of auth/limit semantics, robust failover behavior.

# 6. Context Model
- Environment: Cloudflare Workers global runtime.
- Constraints: Edge execution limits, environment variable isolation, CODE_ONLY sandbox during testing.

# 7. Intelligence Architecture
- Reasoning Engine: Dual-agent consensus loop (CIA & CTO).
- Memory Model: InMemoryMemory with context-aware summarization thresholds.

# 8. Technical Delegation
- CTO is delegated to design the API routing, auth middleware, rate-limiting, and model binding execution.

# 9. Evolution Impact
- Improves Lyzer Labs' quantitative intelligence capacity by formalizing semantic boundaries for visual assets.

# 10. Drift Risks
- "Token" could refer to either Authorization Tokens or Rate-limiting tokens. This must be resolved.

# 11. Cognitive Snapshot
- State: INITIALIZING_DEBATE
- Consensus Level: 0.1`,

  `# 1. Observer Analysis
- Primary Observer: CIA.
- Secondary Observers: CTO, Compliance.

# 2. Semantic Map
- Detected Semantic Drift: The word "Token" is overloaded in the CTO's proposal. It is used both as "Bearer token" (Authentication credential) and "Token bucket" (Rate limiting unit).
- Resolution: We must partition these concepts into \`CredentialToken\` and \`RateLimitUnit\`.

# 3. Epistemic Map
- Assumption: The CTO assumed local volatile memory for rate-limiting is acceptable.
- Risk: This is an epistemic failure of context. Edge runtimes scale horizontally; local volatile memory will cause rate limit leakage.

# 4. Domain Ontology
- Updates:
  - Add \`CredentialToken\` (maps identity to access).
  - Add \`RateLimitUnit\` (quantifies consumption capacity).
  - Clarify relationship: CredentialToken owns RateLimitUnit.

# 5. Goal Architecture
- Target: Correct the semantic drift of "Token" to ensure engineering clarity.

# 6. Context Model
- Shift from single-instance execution model to distributed edge execution model.

# 7. Intelligence Architecture
- Requesting the CTO to modify the domain model and system design to isolate credential verification from rate constraints.

# 8. Technical Delegation
- CTO must redesign the middleware to explicitly separate Auth (checking CredentialToken) and Rate Limiting (managing RateLimitUnit).

# 9. Evolution Impact
- Prevents cognitive degradation of the security model.

# 10. Drift Risks
- Overloaded terms in middleware will lead to security exploits due to logic confusion.

# 11. Cognitive Snapshot
- State: ANALYZING_DRIFT
- Consensus Level: 0.4`,

  `# 1. Observer Analysis
- Primary Observer: CIA.
- Secondary Observers: CTO, Quant Research.

# 2. Semantic Map
- "CredentialToken" and "RateLimitUnit" are now correctly mapped.
- New area: "Generated Image Metadata". We must record prompt parameters, seeds, and models to preserve quantitative research context.

# 3. Epistemic Map
- Inference: Storing generated image parameters is vital for prompt engineering evolution.
- Assumption: Workers AI returns sufficient metadata (seed, parameters) with the generated image.

# 4. Domain Ontology
- Add \`ImageMetadata\` (contains prompt, seed, model, timestamp, and generating CredentialToken).

# 5. Goal Architecture
- Primary Goal: Research traceability.
- Success Criteria: API responses include model metadata and execution statistics.

# 6. Context Model
- Client applications consuming the API need standardized JSON envelopes containing metadata.

# 7. Intelligence Architecture
- CTO must define the JSON response schema for \`/v1/images/generate\` that embeds \`ImageMetadata\`.

# 8. Technical Delegation
- CTO to write the schema validation and response formatting module.

# 9. Evolution Impact
- Quantitative researchers can track prompt stability over time.

# 10. Drift Risks
- Model updates might silently change image generation characteristics. We must log the exact model name.

# 11. Cognitive Snapshot
- State: ANALYZING_METADATA_FLOW
- Consensus Level: 0.7`,

  `# 1. Observer Analysis
- Primary Observer: CIA.
- Secondary Observers: CTO, CEO, Quant Research.

# 2. Semantic Map
- All concepts (CredentialToken, RateLimitUnit, ImageMetadata) are now aligned and stabilized.

# 3. Epistemic Map
- Verified: CTO's proposed response schema meets all criteria for traceability.

# 4. Domain Ontology
- Complete.

# 5. Goal Architecture
- Fully aligned.

# 6. Context Model
- Standardized edge deployment.

# 7. Intelligence Architecture
- No further revisions required.

# 8. Technical Delegation
- Authorizing CTO to proceed with implementation.

# 9. Evolution Impact
- Positive. The governance setup is robust.

# 10. Drift Risks
- Monitored.

# 11. Cognitive Snapshot
- State: STABLE
- Consensus Level: 1.0

DECISION: APPROVED`
];

const CTO_RESPONSES = [
  `# 1. Technical Situation
- Proposing the implementation of FIAPI using Cloudflare Workers and wrangler.json.
- Entrypoint: \`src/index.js\` handling HTTP requests.
- Endpoints: \`GET /health\`, \`GET /v1/models\`, \`POST /v1/images/generate\`, and \`GET /docs\`.

# 2. Epistemic Review
- Verified Fact: Cloudflare Workers execute JavaScript on the edge.
- Assumption: InMemoryMemory will run on a centralized node or simulated runner for the debate, while the actual API execution runs in the serverless worker.
- Flagged Risk: Memory state is ephemeral in edge environments unless backed by KV or Durable Objects.

# 3. Executive Intent Map
- Translate "durable image generation pipeline" into a robust Cloudflare Worker schema.
- Constraints: Wrangler runtime, Bearer token authorization, Workers AI bindings.

# 4. Domain Model
- Request -> [Auth Middleware] -> [Rate Limit Middleware] -> [Workers AI Router] -> Response.

# 5. Architectural Assessment
- Simple: Edge routing via standard router middleware.
- Reliable: Fallback logic for model bindings.
- Scale: Cloudflare's global distribution handles high request volumes.

# 6. Engineering Impact Analysis
- Middleware decoupling ensures modular testing.
- AI binding performance must be monitored.

# 7. System Design
- Routing layer: \`src/index.js\` imports auth and rate limit middleware.
- Auth middleware: Extracts Bearer token, validates against configured tokens.
- Rate-limiting: Token bucket rate limiter.

# 8. Assigned AG-Kit Teams
- Platform Engineering: Auth and rate limit routing.
- AI Systems: Workers AI integrations.

# 9. Execution Plan
- Phase 1: Router and endpoints skeleton.
- Phase 2: Auth & rate limiting middleware.
- Phase 3: Workers AI integration.

# 10. Risks and Constraints
- Edge timeout constraints (typically 10-30 seconds depending on plan).

# 11. Integration Requirements
- Integration tests simulating valid/invalid auth, rate limits, and model binding execution.

# 12. CTO Technical Snapshot
- State: PROPOSED_INITIAL_ARCHITECTURE
- Debt: Volatile memory for rate limits (will need KV/Durable Objects in production).`,

  `# 1. Technical Situation
- Acknowledged semantic drift and epistemic risks regarding local volatile memory.
- Modifying architecture to isolate \`CredentialToken\` and \`RateLimitUnit\` semantic boundaries.

# 2. Epistemic Review
- Verified Fact: In serverless architectures, standard in-memory rate limiting fails across multiple edge instances.
- Solution: We will utilize Cloudflare KV or Durable Objects for persistent \`RateLimitUnit\` tracking, but provide an abstract local memory fallback for local test harnesses.

# 3. Executive Intent Map
- Goal: Secure and robust API execution.
- Constraints: Separation of concerns.

# 4. Domain Model
- Request -> [Auth Middleware (CredentialToken)] -> [Rate Limit Middleware (RateLimitUnit)] -> [Workers AI Router] -> Response.

# 5. Architectural Assessment
- Partitioned middleware stack ensures that Authentication and Rate Limiting execute in distinct code paths, preventing logic pollution.

# 6. Engineering Impact Analysis
- Clean separation allows isolated unit testing of each middleware module.

# 7. System Design
- \`src/middleware/auth.js\`: Implements Bearer token extraction and validation.
- \`src/middleware/rateLimit.js\`: Implements rate-limiting check using an abstract rate-limiting storage interface.

# 8. Assigned AG-Kit Teams
- Platform Engineering: Middleware split and testing.

# 9. Execution Plan
- Update wrangler configuration to include KV namespaces for rate limiting.
- Implement isolated tests for auth and rate-limiting.

# 10. Risks and Constraints
- Latency of KV lookups on every request.

# 11. Integration Requirements
- E2E tests validating that unauthorized requests are blocked before rate limiting is evaluated.

# 12. CTO Technical Snapshot
- State: REVISED_ARCHITECTURE
- Debt: Minimized. Semantic boundaries cleared.`,

  `# 1. Technical Situation
- Addressing requirements for research traceability and ImageMetadata.
- Designing the API response envelope to return structured JSON.

# 2. Epistemic Review
- Verified Fact: Workers AI image endpoints return binary image data or base64 data.
- Solution: We will wrap the base64 output in a JSON envelope alongside metadata.

# 3. Executive Intent Map
- Response format:
  \`\`\`json
  {
    "success": true,
    "data": {
      "image": "base64...",
      "metadata": {
        "prompt": "...",
        "model": "...",
        "seed": 12345,
        "timestamp": "..."
      }
    }
  }
  \`\`\`

# 4. Domain Model
- Model Binding output combined with request parameters to form \`ImageMetadata\` schema.

# 5. Architectural Assessment
- Return JSON envelope enables extensibility, supporting multiple images or additional stats.

# 6. Engineering Impact Analysis
- Clients must adapt to JSON response rather than raw binary streams.

# 7. System Design
- Router parses query/body -> checks auth & rate limits -> runs model -> constructs response JSON envelope -> returns HTTP 200.

# 8. Assigned AG-Kit Teams
- Platform Engineering: JSON response schema.
- Quantitative Engineering: Metadata logging specification.

# 9. Execution Plan
- Define JSON response formats in OpenAPI specification.
- Write E2E test assertions validating response envelope structure.

# 10. Risks and Constraints
- Base64 encoding increases payload size by ~33%.

# 11. Integration Requirements
- Verify that metadata fields are present in the response.

# 12. CTO Technical Snapshot
- State: FINALIZED_SYSTEM_DESIGN
- Debt: None. Complete alignment on semantics and tech execution.`,

  `# 1. Technical Situation
- All requirements satisfied.
- Code skeleton and API interfaces prepared.

# 2. Epistemic Review
- Verified: Systems fully aligned with CIA cognitive specifications.

# 3. Executive Intent Map
- Implemented.

# 4. Domain Model
- Stable.

# 5. Architectural Assessment
- Signed off.

# 6. Engineering Impact Analysis
- No structural debt.

# 7. System Design
- Complete.

# 8. Assigned AG-Kit Teams
- Ready for implementation.

# 9. Execution Plan
- Finalized.

# 10. Risks and Constraints
- Monitored.

# 11. Integration Requirements
- Verified.

# 12. CTO Technical Snapshot
- State: DEPLOYED_GOVERNANCE_Council
- Consensus Level: 1.0`
];

module.exports = {
  CIA_RESPONSES,
  CTO_RESPONSES
};
