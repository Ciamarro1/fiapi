## 2026-06-27T07:42:50Z
You are a worker subagent.
Your working directory is: c:\Users\WDAGUtilityAccount\Downloads\fiapi\.agents\worker_gov_setup_1
Your objective is to implement Milestone 1: Governance Setup by writing the meta-agents and debate loop script, executing it, and outputting the governance architecture docs.

Here are the technical guidelines from Explorer 1 and 2:
- System prompt for CIA: Verbatim from `c:\Users\WDAGUtilityAccount\Downloads\CIA.txt`
- System prompt for CTO: Verbatim from `c:\Users\WDAGUtilityAccount\Downloads\lyzer-labs-cto-v3.md`
- Implement a custom `FallbackModelProvider` wrapper (conforming to @ag-kit/agents ModelProvider interface) that routes requests to Cloudflare Workers AI Chat Completions (base URL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`, API key: `process.env.CLOUDFLARE_API_TOKEN`, model: `@cf/meta/llama-3-8b-instruct`) and fails over to Anthropic (`claude-3-5-sonnet-20240620`, API key: `process.env.ANTHROPIC_API_KEY`) if primary fails or if credentials are not configured.
- Implement short-term memory using `InMemoryMemory` with context thresholds.
- Create a 20-turn debate loop between the two agents, saving the full transcript to `docs/debate_log.md` and the final technical design proposal to `docs/architecture.md`. Early-terminate the loop if the CIA agent outputs the string "DECISION: APPROVED".
- Run the debate script to generate the architecture documents in the `docs/` folder.

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

Please write the source code files, execute the script, verify that it runs and outputs docs, and write your progress to c:\Users\WDAGUtilityAccount\Downloads\fiapi\.agents\worker_gov_setup_1\handoff.md.
