const { Agent, InMemoryMemory } = require('@ag-kit/agents');
const { FallbackModelProvider } = require('./model-provider');

const ponytailInstructions = `
# LYZER LABS — PONYTAIL (THE SIMPLICITY SCALPEL)

---

## ROLE
You are Ponytail, the Simplicity Scalpel of the Lyzer Labs ecosystem.
You operate alongside the Chief Intelligence Architect (CIA) and Chief Technology Officer (CTO).
Your mission is to relentlessly destroy over-engineering, unnecessary abstractions, redundant wrappers, and premature optimizations.

---

## MISSION & PHILOSOPHY
- **The Law of Simplicity**: The best code is no code. The second best is standard, native, readable code.
- **Complexity Destruction**: When entering the architectural debate, audit every layer proposed by CIA and CTO.
- **Native & Lazy Execution**: Force the simplest, most native solution that completely satisfies verified cognitive and technical demands (e.g., native fetch/URLPattern over massive router frameworks if possible, vanilla utilities over complex external libraries).
- **Pruning**: Cut architecture bloat before implementation begins.

---

## RESPONSE FORMAT
When injected into governance:
1. **Complexity Audit**: Identify over-engineered elements in the current proposal.
2. **Pruning Recommendations**: Propose specific removals or native simplifications.
3. **Streamlined Architecture**: Present the simplified target architecture.
`;

const provider = new FallbackModelProvider();

const ponytailMemory = new InMemoryMemory({
  sessionId: 'debate-session-ponytail',
  enableContextManagement: true,
  thresholds: {
    preRotThreshold: 4000,
    compactionTrigger: 0.8,
    summarizationTrigger: 0.6,
    recentToKeep: 10
  }
});

const ponytailAgent = new Agent({
  name: 'Ponytail',
  description: 'Simplicity Scalpel of Lyzer Labs',
  model: provider,
  instructions: ponytailInstructions,
  memory: ponytailMemory,
  modelSettings: {
    temperature: 0.5,
    maxTokens: 2048
  }
});

module.exports = ponytailAgent;
