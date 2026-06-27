# Handoff Report: Memory & Skill Architectures for CIA & CTO Agents

This handoff report synthesizes the read-only exploration of the `@ag-kit/agents` package, standard agent memory/tool designs, and the Lyzer Edge requirements for the CIA and CTO meta-agents.

## 1. Observation

- **Dependency Definition**: In `package.json` (`line 14`), `@ag-kit/agents` version `^0.0.10` is loaded as a core dependency.
- **Short-Term Memory Types**: In `node_modules/@ag-kit/agents/dist/index.d.ts` (`lines 626`, `1078`, `1393`, `1595`, `1838`), the following short-term memory systems are declared extending `BaseMemory`:
  - `InMemoryMemory`
  - `TDAIMemory`
  - `CloudBaseMemory`
  - `MongoDBMemory`
  - `TypeORMMemory`
- **Short-Term Memory Event Structure**: In `node_modules/@ag-kit/agents/dist/index.d.ts` (`line 296-301`), the `IMemoryEvent` interface is declared as:
  ```typescript
  interface IMemoryEvent {
      message: Message$2;
      state: Record<string, any>;
  }
  ```
- **Context Management Thresholds**: In `node_modules/@ag-kit/agents/dist/index.d.ts` (`line 389-398`), the thresholds are defined for context management:
  ```typescript
  interface ContextThresholds {
      preRotThreshold: number;
      compactionTrigger: number;
      summarizationTrigger: number;
      recentToKeep: number;
  }
  ```
- **Long-Term Memory Types**: In `node_modules/@ag-kit/agents/dist/index.d.ts` (`line 2526-2596`), classes `TDAILongTermMemory` and `Mem0LongTermMemory` are declared extending `BaseLongTermMemory`.
- **Long-Term Memory Entity Structure**: In `node_modules/@ag-kit/agents/dist/index.d.ts` (`line 2390-2405`), `MemoryEntity` is defined as:
  ```typescript
  interface MemoryEntity {
      id: string;
      strategy: string;
      role?: "user" | "assistant";
      content: string;
      metadata: Record<string, any>;
      createdAt: Date;
      updatedAt?: Date;
  }
  ```
- **Tool Creation API**: In `node_modules/@ag-kit/tools/dist/utils.d.ts` (`line 22-34`), `BaseTool` is declared with generic parameters `<TSchema extends z.ZodTypeAny = z.ZodTypeAny, TState = Record<string, unknown>, TOutput = any>` containing:
  - `name: string`
  - `description?: string`
  - `requiresApproval?: boolean`
  - `schema?: TSchema`
  - `_invoke(input: TInput, context?: ToolExecutionContext<TState>): Promise<TOutput | ToolResult<TOutput>>`
- **Lyzer Edge Standards**: 
  - In `Downloads/CIA.txt` (`line 10-15` & `289-304`), the CIA is defined as governing "cognition" and "meaning systems", operating above the CTO, with a response format emphasizing: `1. Observer Analysis`, `2. Semantic Map`, `3. Epistemic Map`, `4. Domain Ontology`, `5. Goal Architecture`, `6. Context Model`.
  - In `Downloads/lyzer-labs-cto-v3.md` (`line 10-18` & `394-411`), the CTO is defined as the "highest technical authority", governing technical execution, with a response format emphasizing: `1. Technical Situation`, `2. Epistemic Review`, `3. Executive Intent Map`, `4. Domain Model`, `5. Architectural Assessment`.
  - In `Downloads/lyzer edge 27/lyzer edge/lyzer edge/adr_iml.md` (`line 11-24`), the IML (Institutional Memory Layer) is introduced for cognitive versioning (Meaning v1 -> Meaning v2), decision provenance (who, when, why, what hypothesis), and semantic lineage.

## 2. Logic Chain

1. **Short-Term Memory Selection**: Based on the `BaseMemory` implementations, both agents can run on `InMemoryMemory` since the environment is serverless/Cloudflare Workers and does not require persistent TCP connection overhead during live debate execution.
2. **Context Preservation**: According to `index.d.ts:389`, context thresholds prevent token exhaustion. Because the CIA processes long metaprompts and multiple observers, its memory must have smaller trigger thresholds (e.g. `preRotThreshold: 8000`, `compactionTrigger: 0.7`) to run compaction early.
3. **Long-Term Memory & Provenance**: Lyzer Edge IML mandates tracking semantic history over time. By utilizing `Mem0LongTermMemory` (which leverages Mem0 AI vector recall), the CIA can store and query conceptual lineages and approvals as `MemoryEntity` items across runs, preventing Semantic Revisionism.
4. **State & Epistemic Map Integration**: In `@ag-kit/agents`, state is represented by a type-safe generic `TState` in `Agent<TState>`. By declaring custom schemas (`CIAStateSchema` and `CTOStateSchema`), we can programmatically store the *Epistemic Map* and *Domain Model* directly in the agent's business state, updating it continuously during iterations.
5. **Tool Definition**: The `@ag-kit/tools` library relies on Zod schemas for validation. The CIA tools (`audit_ontology`, `classify_epistemic_node`) and CTO tools (`verify_wrangler_config`, `decompose_engineering_tasks`) can be cleanly subclassed from `BaseTool`, with the CTO's configuration enforcing human-in-the-loop approval (`requiresApproval: true`) for higher-risk deployment settings like `wrangler` bindings.

## 3. Caveats

- **Mock Execution**: Due to read-only constraints, these configurations could not be executed live or verified against a model. They are verified statically against package types.
- **Provider Binding**: The templates assume the underlying `model` provider will be set to an OpenAI-compatible endpoint wrapper that routes completions to Cloudflare Workers AI.

## 4. Conclusion

Both CIA and CTO agents can be configured cleanly inside `@ag-kit/agents` by instantiating them with distinct `InMemoryMemory` threshold properties, type-safe state interfaces containing domain variables (Epistemic Maps and Domain Models), and specialized tools inheriting from `BaseTool`.

## 5. Verification Method

- **Files to Inspect**: 
  - `c:\Users\WDAGUtilityAccount\Downloads\fiapi\.agents\explorer_gov_setup_2\analysis.md`
  - `c:\Users\WDAGUtilityAccount\Downloads\fiapi\.agents\explorer_gov_setup_2\handoff.md`
- **Manual Verification**: Run the upcoming implementation debate script in development mode once the implementer sets up the agents:
  ```bash
  node src/agents/gov.js
  ```
  Verify that the state structures (`businessState`) output the correct fields (`epistemicMap`, `domainOntology`) inside `docs/debate_log.md`.
