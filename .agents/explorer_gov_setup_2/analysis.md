# Analysis: Cognitive Memory and Skill Architectures for CIA & CTO Agents

This report details the architectural design of the memory systems and tool/skill schemas for the **Chief Intelligence Architect (CIA)** and **Chief Technology Officer (CTO)** agents of the FIAPI Governance Council. The design is built upon **Lyzer Edge Standards** and configured using the APIs of `@ag-kit/agents` and `@ag-kit/tools`.

---

## 1. Lyzer Edge Standards for Agent Design

The Lyzer Labs ecosystem distinguishes clearly between corporate strategy, cognitive semantics (governed by the CIA), and technical engineering systems (governed by the CTO). 

### 1.1 The Chief Intelligence Architect (CIA) Agent
The CIA governs the **meaning systems** that make technical execution possible. It does not govern code or infrastructure. Its memory and skill structures must enforce semantic integrity, ontological consistency, and epistemic correctness.
- **Epistemic Classification**: The CIA must classify all incoming request information using the *Epistemic Map* taxonomy:
  - `VERIFIED FACT` (proven by empirical evidence)
  - `INFERENCE` (logical deduction from facts)
  - `ASSUMPTION` (unverified belief requiring validation)
  - `HYPOTHESIS` (proposed correlation or trend)
  - `UNKNOWN` (unresolved gaps)
- **Cognitive Versioning & Lineage**: Guided by the **Institutional Memory Layer (IML)** (Release 1.7.8), the CIA's memory operates as a versioned history tree (like Git for ontologies). It prevents "Semantic Revisionism" by recording the *provenance* of decisions: who authorized a change, why, when, and what empirical hypothesis supported it.
- **Observer Modeling**: The CIA builds an *Observer Conflict Matrix* mapping how different stakeholder roles (CEO, CTO, Compliance, Quant, Client, etc.) view a technical problem.

### 1.2 The Chief Technology Officer (CTO) Agent
The CTO is the highest technical authority, responsible for system survivability, scalability, maintainability, and operational excellence. 
- **Constitutional Memory Layer (CER)**: The CTO's memory records technical "scars"—historical failures, architectural debt, and system alerts.
- **Historical Causal Memory (The Oracle)**: An append-only SQLite/TypeORM registry that stores market/system regimes to compute the **Live-Historical Divergence Score (LHDS)**.
- **Lock-Free Shared Memory Loops**: Uses mmap-backed, 64-byte `repr(C)` structures (`ExecutionFeedbackEvent`) to coordinate low-latency actions between the technical runtime and agents.

---

## 2. Memory & Skill Configurations in `@ag-kit/agents`

The `@ag-kit/agents` package provides concrete interfaces for short-term, state, and long-term memory, as well as tool execution contracts.

### 2.1 Short-Term Memory (`BaseMemory`)
Short-term memory manages active session history and conversation context.
* **Core API**: Extend `BaseMemory` or use `InMemoryMemory`, `MongoDBMemory`, `MySQLMemory`, or `TDAIMemory`.
* **Context Engineering**: It has built-in triggers to prevent context window explosion via:
  - **Compaction**: Moving original content into the `event.state.__compaction__` metadata while replacing it with a compressed summary (reversible decompression is supported).
  - **Summarization**: Irreversible refinement of old messages into a `StructuredSummary` object.
  - **Context Thresholds**: Configured using:
    ```typescript
    interface ContextThresholds {
        preRotThreshold: number;       // Where performance degrades (e.g., token limit)
        compactionTrigger: number;     // Percentage of pre-rot limit to trigger compaction (e.g., 0.7)
        summarizationTrigger: number;  // Percentage to trigger summarization (e.g., 0.85)
        recentToKeep: number;          // Number of recent events preserved in raw form
    }
    ```

### 2.2 Agent State (`TState`)
The `Agent` class has type generic parameters `<TState extends StateConstraint = StateConstraint, TOutput extends OutputConstraint = string>`.
* **Execution State (`AgentState<TState>`)**:
  Tracks runtime metrics alongside the domain state:
  ```typescript
  interface AgentState<TState = unknown> {
      businessState: TState;           // Type-safe business domain data
      context: RunContext<TState>;     // Execution messages and metadata
      conversationId?: string;
      runId?: string;
      status: "idle" | "running" | "paused" | "error";
      lastActivity?: Date;
  }
  ```
* **State Operations**: The business state is initialized in the constructor via `stateType` and read/updated using `agent.getState()` and `agent.setState(partialState)`.

### 2.3 Long-Term Memory (`BaseLongTermMemory`)
Used for persistent semantic knowledge across conversation sessions.
* **Core API**: Extended by `Mem0LongTermMemory` (integrates the Mem0 AI vector memory client) and `TDAILongTermMemory`.
* **Mechanism**: Automatically extracts semantic facts from finished dialogues using an LLM. It stores them as `MemoryEntity` objects (`id`, `strategy`, `role`, `content`, `metadata`, `createdAt`). It supports vector similarity search via `semanticSearch(query, options)`.

### 2.4 Skills and Tools (`BaseTool`)
* **BaseTool Class**: Tools extend `BaseTool<TSchema, TState, TOutput>`. They define:
  - `schema: TSchema` (Zod schema for inputs).
  - `_invoke(input: TInput, context: ToolExecutionContext<TState>)`: Execution logic. The execution context injects `conversationId`, `runId`, and the agent's current state.
* **Functional Wrapper**: The `tool(func, options)` helper creates a `DynamicTool` inline.
* **Gating**: Approvals are configured in `AgentConfig.humanInTheLoop` via `highRiskTools` or `requireApproval`.

---

## 3. Concrete Example Configs & Tool Schemas

Below are concrete TypeScript implementations of the CIA and CTO memory structures and tools.

### 3.1 Chief Intelligence Architect (CIA) Configuration

#### State and Types Schema
```typescript
import { z } from 'zod';

export const CIAStateSchema = z.object({
  activeObservers: z.array(z.string()),
  epistemicMap: z.object({
    verifiedFacts: z.array(z.string()),
    inferences: z.array(z.string()),
    assumptions: z.array(z.string()),
    hypotheses: z.array(z.string()),
    unknowns: z.array(z.string()),
  }),
  domainOntology: z.array(z.object({
    concept: z.string(),
    definition: z.string(),
    version: z.number(),
    parentConcept: z.string().optional(),
  })),
  semanticDrifts: z.array(z.object({
    concept: z.string(),
    driftDescription: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
  })),
});

export type CIAState = z.infer<typeof CIAStateSchema>;
```

#### Tool 1: `AuditOntologyTool`
```typescript
import { BaseTool, ToolResult } from '@ag-kit/tools';
import { z } from 'zod';
import { CIAState } from './cia-types';

const AuditOntologySchema = z.object({
  proposedConcept: z.string().describe("The term/concept proposed in the system design."),
  contextOfUse: z.string().describe("The technical context or database column where it is defined."),
});

type AuditOntologyInput = z.infer<typeof AuditOntologySchema>;

export class AuditOntologyTool extends BaseTool<typeof AuditOntologySchema, CIAState> {
  constructor() {
    super({
      name: 'audit_ontology',
      description: 'Reviews proposed system terms against the registered domain ontology to prevent Semantic Drift.',
      schema: AuditOntologySchema,
      requiresApproval: false
    });
  }

  protected async _invoke(
    input: AuditOntologyInput,
    context?: any
  ): Promise<any> {
    const state: CIAState = context?.state?.businessState;
    if (!state || !state.domainOntology) {
      return new ToolResult({ success: false, error: "Ontology state is unavailable." });
    }

    const matchedConcept = state.domainOntology.find(
      c => c.concept.toLowerCase() === input.proposedConcept.toLowerCase()
    );

    if (matchedConcept) {
      return new ToolResult({
        success: true,
        data: {
          status: 'MATCHED',
          message: `Concept matches official ontology (v${matchedConcept.version}): ${matchedConcept.definition}`,
          concept: matchedConcept
        }
      });
    }

    // Check drift vectors
    const driftRisk = state.semanticDrifts.find(
      d => d.concept.toLowerCase() === input.proposedConcept.toLowerCase()
    );

    return new ToolResult({
      success: true,
      data: {
        status: 'UNREGISTERED_CONCEPT',
        message: 'Concept is not defined in the domain ontology. Risk of Semantic Ambiguity.',
        driftRisk: driftRisk || null
      }
    });
  }
}
```

#### Tool 2: `EpistemicClassifierTool`
```typescript
const EpistemicClassifierSchema = z.object({
  statement: z.string().describe("The assertion or requirement to classify."),
  evidenceSource: z.string().optional().describe("Source backing the statement."),
});

export class EpistemicClassifierTool extends BaseTool<typeof EpistemicClassifierSchema, CIAState> {
  constructor() {
    super({
      name: 'classify_epistemic_node',
      description: 'Classifies a requirement or architectural claim into verified facts, inferences, or assumptions.',
      schema: EpistemicClassifierSchema,
      requiresApproval: false
    });
  }

  protected async _invoke(input: any, context?: any): Promise<any> {
    const hasEvidence = !!input.evidenceSource;
    const classification = hasEvidence ? 'VERIFIED_FACT' : 'ASSUMPTION';
    
    return new ToolResult({
      success: true,
      data: {
        statement: input.statement,
        classification,
        recommendsAudit: !hasEvidence,
        auditInstruction: hasEvidence 
          ? "Preserve fact linkage." 
          : "Flag as risky. Requires engineering verification before technical design."
      }
    });
  }
}
```

#### CIA Agent Instantiation Template
```typescript
import { Agent, InMemoryMemory, Mem0LongTermMemory } from '@ag-kit/agents';
import { AuditOntologyTool, EpistemicClassifierTool } from './cia-tools';
import { CIAState } from './cia-types';

const ciaShortMemory = new InMemoryMemory({
  sessionId: 'governance-session-001',
  enableContextManagement: true,
  thresholds: {
    preRotThreshold: 8000,
    compactionTrigger: 0.7, // Compact at 5.6k tokens
    summarizationTrigger: 0.85, // Summarize at 6.8k tokens
    recentToKeep: 5
  }
});

const ciaLongMemory = new Mem0LongTermMemory({
  apiKey: process.env.MEM0_API_KEY,
  agentId: 'cia-governor-agent',
  appId: 'fiapi-governance'
});

export const ciaAgent = new Agent<CIAState>({
  name: 'Chief_Intelligence_Architect',
  description: 'Enforces semantic integrity, epistemic mapping, and teleological alignment.',
  model: null, // Initialized with FallbackModelProvider wrapper in gov.js
  instructions: fs.readFileSync('./Downloads/CIA.txt', 'utf-8'),
  memory: ciaShortMemory,
  tools: [new AuditOntologyTool(), new EpistemicClassifierTool()],
  controlFlow: {
    maxSteps: 10,
    errorRetryLimit: 3
  }
});
```

---

### 3.2 Chief Technology Officer (CTO) Configuration

#### State and Types Schema
```typescript
export const CTOStateSchema = z.object({
  intentMap: z.object({
    explicitObjectives: z.array(z.string()),
    constraints: z.array(z.string()),
    ambiguities: z.array(z.string()),
  }),
  domainModel: z.object({
    entities: z.array(z.string()),
    boundaries: z.array(z.string()),
  }),
  architectureSnapshot: z.object({
    existingComponents: z.array(z.string()),
    dependencies: z.array(z.string()),
    performanceThresholdMs: z.number(),
  }),
});

export type CTOState = z.infer<typeof CTOStateSchema>;
```

#### Tool 1: `DecomposeEngineeringTasksTool`
```typescript
const DecomposeTasksSchema = z.object({
  systemModule: z.string().describe("The module system to decompose (e.g. 'Auth', 'Rate-Limiter')."),
  requirements: z.array(z.string()).describe("List of requirements to fulfill in the task group."),
});

export class DecomposeEngineeringTasksTool extends BaseTool<typeof DecomposeTasksSchema, CTOState> {
  constructor() {
    super({
      name: 'decompose_engineering_tasks',
      description: 'Decomposes high-level requirements into standardized technical implementation missions.',
      schema: DecomposeTasksSchema,
      requiresApproval: false
    });
  }

  protected async _invoke(input: any, context?: any): Promise<any> {
    const tasks = input.requirements.map((req: string, idx: number) => ({
      taskId: `${input.systemModule.toUpperCase()}-T${idx + 1}`,
      objective: `Implement ${req}`,
      acceptanceCriteria: `Verified by E2E test suite.`,
      failureModes: [`Latency spike`, `Validation bypass`],
    }));

    return new ToolResult({
      success: true,
      data: {
        module: input.systemModule,
        tasks
      }
    });
  }
}
```

#### Tool 2: `VerifyWranglerConfigTool`
```typescript
const VerifyWranglerSchema = z.object({
  wranglerJsonContent: z.string().describe("Stringified wrangler.json to audit."),
});

export class VerifyWranglerConfigTool extends BaseTool<typeof VerifyWranglerSchema, CTOState> {
  constructor() {
    super({
      name: 'verify_wrangler_config',
      description: 'Verifies the integrity of Cloudflare Workers wrangler binding declarations.',
      schema: VerifyWranglerSchema,
      requiresApproval: true // Requires explicit approval before accepting config changes
    });
  }

  protected async _invoke(input: any, context?: any): Promise<any> {
    let config;
    try {
      config = JSON.parse(input.wranglerJsonContent);
    } catch {
      return new ToolResult({ success: false, error: 'Invalid JSON format in wrangler config.' });
    }

    const hasAI = config.ai || (config.bindings && config.bindings.some((b: any) => b.type === 'ai'));
    if (!hasAI) {
      return new ToolResult({
        success: true,
        data: {
          valid: false,
          reason: 'Missing Cloudflare Workers AI binding. FIAPI requires `@cf/meta/llama-3-8b-instruct` or Flux.'
        }
      });
    }

    return new ToolResult({
      success: true,
      data: {
        valid: true,
        bindingsFound: ['ai']
      }
    });
  }
}
```

#### CTO Agent Instantiation Template
```typescript
import { Agent, InMemoryMemory, Mem0LongTermMemory } from '@ag-kit/agents';
import { DecomposeEngineeringTasksTool, VerifyWranglerConfigTool } from './cto-tools';
import { CTOState } from './cto-types';

const ctoShortMemory = new InMemoryMemory({
  sessionId: 'governance-session-001',
  enableContextManagement: true,
  thresholds: {
    preRotThreshold: 12000,
    compactionTrigger: 0.75, // Compact at 9k tokens
    summarizationTrigger: 0.9, // Summarize at 10.8k tokens
    recentToKeep: 8
  }
});

const ctoLongMemory = new Mem0LongTermMemory({
  apiKey: process.env.MEM0_API_KEY,
  agentId: 'cto-executive-agent',
  appId: 'fiapi-governance'
});

export const ctoAgent = new Agent<CTOState>({
  name: 'CTO_Executive_Director',
  description: 'Governs platform engineering, system specifications, and task breakdown assignments.',
  model: null, // Initialized with FallbackModelProvider wrapper in gov.js
  instructions: fs.readFileSync('./Downloads/lyzer-labs-cto-v3.md', 'utf-8'),
  memory: ctoShortMemory,
  tools: [new DecomposeEngineeringTasksTool(), new VerifyWranglerConfigTool()],
  humanInTheLoop: {
    enabled: true,
    requireApproval: ['verify_wrangler_config'], // Gate safety changes
    defaultAction: 'reject'
  },
  controlFlow: {
    maxSteps: 15,
    errorRetryLimit: 3
  }
});
```
