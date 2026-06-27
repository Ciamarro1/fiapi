# Analysis: Governance Agents Setup with @ag-kit/agents

This report provides a read-only investigation and architectural blueprint for implementing the **Agent Governance Council** (Milestone 1) using the `@ag-kit/agents` package.

---

## 1. Agent Creation and Configuration in `@ag-kit/agents`

### Agent Class and Lifecycle
The core of the package is the `Agent` class (`node_modules/@ag-kit/agents/dist/index.d.ts:3154`), which takes an `AgentConfig` configuration object. Key points of the configuration and lifecycle:
- **Instantiating**: Created via `new Agent(config: AgentConfig)`.
- **Config**: 
  - `name` (string, required): Used to identify the agent.
  - `model` (`ModelProvider` instance, required): The underlying LLM provider. Passing a string throws `Error("String-based model provider not yet implemented")` at runtime (`index.js:4467`).
  - `instructions` (string or function): System prompt/metaprompt directing the agent's behavior.
  - `tools` (`BaseTool[]`, optional): Tools the agent can call.
  - `memory` (`BaseMemory`, optional): Short-term memory implementation (defaults to `InMemoryMemory`).
  - `humanInTheLoop` (optional): Human approval configurations for tool execution.
  - `controlFlow` (optional): Configuration for max execution steps and error retry limits.
- **Execution**: 
  - `run(input, state, options)`: Returns `Promise<AgentResult>` representing the full execution, including the final data, tool calls, full message history, and token usage metadata.
  - `stream(input, state, options)`: Returns an `AsyncIterableIterator<AgentEvent>` for streaming output.

---

## 2. LLM Provider Configuration

### Setting up Cloudflare Workers AI
Since the `model` property must receive a `ModelProvider` object, we utilize `createOpenAIProvider` or the `OpenAIProvider` class. Cloudflare Workers AI exposes an OpenAI-compatible chat completion endpoint. 
It can be specified in the agent's configuration as follows:

```javascript
const { createOpenAIProvider } = require('@ag-kit/agents');

const cloudflareProvider = createOpenAIProvider({
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  defaultModel: '@cf/meta/llama-3-8b-instruct', // Primary model
  timeout: 15000,
  maxRetries: 2
});
```

### Specifying Fallback Providers (Fallback Model Wrapper)
Although the package exports a `FallbackModelStrategy` class, it is a placeholder that does not act as an inline failover. To support robust fallbacks (e.g., if Cloudflare rate-limits or fails, fall back to Anthropic or OpenAI), we design a custom wrapper conforming to the `ModelProvider` interface:

```javascript
class FallbackModelProvider {
  constructor(primary, fallback) {
    this.primary = primary;
    this.fallback = fallback;
    this.activeProvider = primary;
  }

  get chat() {
    return {
      completions: {
        create: async (params) => {
          try {
            return await this.primary.chat.completions.create(params);
          } catch (error) {
            console.warn(`[FallbackProvider] Primary (${this.primary.getProviderName()}) failed: ${error.message}. Switching to fallback.`);
            this.activeProvider = this.fallback;
            return await this.fallback.chat.completions.create(params);
          }
        },
        stream: async function*(params) {
          try {
            yield* this.primary.chat.completions.stream(params);
          } catch (error) {
            console.warn(`[FallbackProvider] Primary stream failed: ${error.message}. Switching to fallback.`);
            this.activeProvider = this.fallback;
            yield* this.fallback.chat.completions.stream(params);
          }
        }
      }
    };
  }

  supportsTools() { return this.activeProvider.supportsTools(); }
  supportsStreaming() { return this.activeProvider.supportsStreaming(); }
  formatTools(tools) { return this.activeProvider.formatTools(tools); }
  parseToolCalls(response) { return this.activeProvider.parseToolCalls(response); }
  getProviderName() { return `fallback(${this.primary.getProviderName()} -> ${this.fallback.getProviderName()})`; }
  getDefaultModel() { return this.activeProvider.getDefaultModel(); }
  validateConfig(config) { return true; }
}
```

---

## 3. Metaprompts for CIA and CTO Agents

There are no existing or hidden metaprompts in the packages. They must be structured to explicitly direct the agents' roles:

### CIA (Cognitive, Security, Regulatory, and Policy Governance Agent)
```markdown
You are the Cognitive, Security, Regulatory, and Policy Governance Auditor (CIA Agent).
Your mission is to audit architectural, schema, and implementation proposals to ensure absolute governance.

You represent and must strictly enforce four constraint vectors:
1. POLICY: Content moderation, preventing copyright violation, ensuring strict user consent, and preventing malicious image generation payloads.
2. SECURITY: Zero-trust architecture, secure authorization (Bearer tokens), rate limiting configurations, protection against prompt injection, SSRF, and raw credential leaks.
3. REGULATORY: Data privacy laws compliance (e.g., GDPR, CCPA). Specifically, dictate data lifecycle, logging limits, and access control on generated assets.
4. COGNITIVE: Guarding LLM prompts and API logic against manipulation, hallucination, logical discrepancies, and ensuring deterministic error handling.

When reviewing proposals:
- Identify every governance violation, vulnerability, or risk.
- Explicitly state required architectural changes or constraints.
- If a proposal meets all governance vectors, reply with "DECISION: APPROVED" at the end of your response. Otherwise, point out failures and refuse approval.
```

### CTO (Technical Architecture, performance, schemas, and implementation Agent)
```markdown
You are the Chief Technology Officer and System Architect (CTO Agent).
Your mission is to design a high-performance, developer-friendly, and production-ready Workers AI Image API.

You represent and must maximize four technical vectors:
1. TECHNICAL ARCHITECTURE: Clean code separation, layout structures, Hono or Wrangler framework patterns, and interface contracts.
2. PERFORMANCE: Microsecond-latency execution, caching (Cloudflare KV/Cache API), and efficient image model configuration.
3. DATABASE SCHEMAS: Optimized relational/key-value schemas for token registration, usage logs, rate limiting, and session state.
4. IMPLEMENTATION: Concrete code structure, API responses, status codes, and test strategies.

When proposing or revising:
- Propose specific, actionable schemas, configurations, and Javascript snippets.
- Incorporate feedback from the CIA Agent to resolve security, policy, or regulatory issues with concrete technical design patterns.
- Do not compromise on reliability or latency.
```

---

## 4. 20-Iteration Workflow Script Outline

Below is a proposed Node.js orchestration script skeleton (`src/agents/debate.js` / `src/agents/gov.js`) implementing a structured debate. It manages shared context, implements the 20-iteration loop, and writes outputs to the `docs/` folder.

```javascript
const fs = require('fs');
const path = require('path');
const { Agent, createOpenAIProvider, createAnthropicProvider } = require('@ag-kit/agents');

// 1. Setup Providers
const primaryCFProvider = createOpenAIProvider({
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  defaultModel: '@cf/meta/llama-3-8b-instruct'
});

const fallbackAnthropicProvider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: 'claude-3-5-sonnet-20240620'
});

// Custom Fallback Wrapper
const modelProvider = new FallbackModelProvider(primaryCFProvider, fallbackAnthropicProvider);

// 2. Initialize Agents
const ctoAgent = new Agent({
  name: 'CTO_Agent',
  model: modelProvider,
  instructions: `[CTO Metaprompt Content]`
});

const ciaAgent = new Agent({
  name: 'CIA_Agent',
  model: modelProvider,
  instructions: `[CIA Metaprompt Content]`
});

// 3. Debate Configuration
const maxIterations = 20;
let currentProposal = `
We need to design the FIAPI service.
Core requirements:
- Cloudflare Workers AI endpoint (/v1/images/generate) supporting Flux/SDXL models.
- Bearer token authentication.
- Sliding-window rate limiting.
- Standard OpenAPI health and documentation endpoints.
Please provide the initial technical layout, database schema, and routing structure.
`;

const debateLog = [];
let iteration = 0;
let approved = false;

async function runDebate() {
  console.log('Starting Agent Governance Council Debate...');
  
  while (iteration < maxIterations && !approved) {
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);
    
    // Turn A: CTO Refinement
    console.log('Running CTO Agent...');
    const ctoPrompt = `Here is the current state of the debate:\n\n${debateLog.map(e => `[${e.speaker}]: ${e.content}`).join('\n\n')}\n\nCTO: Please refine the technical proposal, addressing any of the CIA's concerns.`;
    const ctoResult = await ctoAgent.run(ctoPrompt);
    const ctoResponse = ctoResult.data;
    debateLog.push({ speaker: 'CTO', content: ctoResponse });
    
    // Turn B: CIA Audit
    console.log('Running CIA Agent...');
    const ciaPrompt = `Here is the updated proposal from the CTO:\n\n${ctoResponse}\n\nCIA: Audit this proposal. Does it meet all policy, security, regulatory, and cognitive integrity criteria? If yes, output "DECISION: APPROVED" at the very end. If no, highlight failures and required mitigation steps.`;
    const ciaResult = await ciaAgent.run(ciaPrompt);
    const ciaResponse = ciaResult.data;
    debateLog.push({ speaker: 'CIA', content: ciaResponse });
    
    // Check approval status
    if (ciaResponse.includes('DECISION: APPROVED')) {
      approved = true;
      console.log('Governance Approval Received!');
    }
  }

  // 4. Summarize and Write Outputs
  console.log('Exporting debate outputs...');
  const docsDir = path.resolve(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Format and save Debate Log
  const debateLogMd = debateLog.map((log, idx) => `### Turn ${idx + 1}: ${log.speaker}\n\n${log.content}\n\n---`).join('\n\n');
  fs.writeFileSync(path.join(docsDir, 'debate_log.md'), `# Governance Council Debate Log\n\nStatus: ${approved ? 'APPROVED' : 'FAILED_TO_CONVERGE'}\nIterations: ${iteration}\n\n${debateLogMd}`);

  // Generate Final Architecture Document
  let finalArchitecture = '';
  if (approved) {
    // If approved, extract the final CTO proposal as the architecture base
    const lastCTOProposal = debateLog.filter(e => e.speaker === 'CTO').pop()?.content || '';
    finalArchitecture = `# Architecture Specification\n\nThis architecture has been formally approved by the Agent Governance Council.\n\n${lastCTOProposal}`;
  } else {
    finalArchitecture = `# Architecture Specification (UNAPPROVED)\n\nThe Governance Council failed to reach consensus within ${maxIterations} iterations. Please review the debate logs.`;
  }
  fs.writeFileSync(path.join(docsDir, 'architecture.md'), finalArchitecture);
  console.log('Debate files written successfully to docs/.');
}

runDebate().catch(console.error);
```
