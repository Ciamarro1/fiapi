---
name: Cognitive Governance Dialogue & Execution (The Autonomous Factory)
description: Triggers a high-level cognitive debate (CIA vs CTO vs Ponytail), followed by relentless, multi-agent autonomous execution through the 8 pillars of the Lyzer Factory for FIAPI.
trigger: /cg
---
# Cognitive Governance & Autonomous Factory Workflow — FIAPI Edition

Este workflow padroniza a interação entre a camada cognitiva (CIA), a camada técnica (CTO) e o bisturi de simplicidade (Ponytail) no ecossistema Lyzer Labs para o projeto **FIAPI** (Cloudflare Workers AI Image API), seguido pela execução autônoma total.

## FILOSOFIA DE EXECUÇÃO: A LEI DE SISYPHUS
**Delegação Total.** Lance a IA no problema com ferramentas pesadas e deixe-a moer até terminar. Foco obsessivo em não parar até que a lista de TODOs (Task Artifact) esteja vazia. O Antigravity não é um "assistente de código que escreve funções", é uma "fábrica de software que gerencia o ciclo de vida".

## 1. O Debate (20 Iterações Arquiteturais)
Quando acionado via `/cognitive-governance [Problema]`:

1. **Iterações 1 a 15 (CIA x CTO):**
   - O Orchestrator (CTO) ativa o agente CIA (`src/agents/cia.js`).
   - O CIA produz o *Cognitive Snapshot* (Fases 0 a 4: Semântica, Epistemologia, Ontologia e Modelos de Observador).
   - O CTO mapeia isso para a realidade técnica do Cloudflare Workers AI e responde.
   - Eles iteram para destruir ambiguidades, drift semântico e definir a arquitetura.

2. **Iterações 16 a 20 (A Injeção do Ponytail):**
   - Nas últimas 5 iterações do debate, o subagente **Ponytail** (`src/agents/ponytail.js`) é ativado e inserido na conversa.
   - **A Missão do Ponytail:** Destruir a complexidade gerada pelo CIA e CTO. Ele vai forçar a solução mais estúpida, mais nativa e mais preguiçosa que satisfaça as demandas cognitivas e técnicas aprovadas. Ele corta abstrações desnecessárias antes que a arquitetura seja finalizada.

## 2. A Esteira de Execução (Os 8 Pilares da Fábrica FIAPI)
Assim que o debate termina e a arquitetura é selada em `docs/architecture.md`, a execução começa sem intervenção humana:

1. **Orquestração Multi-Agente:** O CTO cria a lista de tarefas e coordena a implementação modular da API (routers Hono, middlewares de auth e rate limiting).
2. **Memória Institucional:** O CTO registra as decisões de arquitetura e ADRs na pasta `docs/` e na memória do projeto.
3. **Raio de Impacto Sintático (AST):** Consulta de dependências e análise topológica para garantir zero breaking changes nas rotas da API.
4. **Verificação Contínua:** Execução autônoma de suítes de teste unitários e E2E (`npm run test:e2e`).
5. **Red Teaming (Equipe Adversária):** Testes de estresse de Rate Limiting e validação de limites de entrada da API.
6. **Evolução de Procedimentos (SOPs):** Padronização do fluxo de governança cognitiva em rotinas reutilizáveis.
7. **Integração e Entrega Contínua (Pre-Push Gatekeeper):** Escaneamento rigoroso contra vaziamento de credenciais ou chaves de API.
8. **Gravação de Estado (The Final Checkpoint):** Consolidação final do estado do projeto e atualização da memória institucional.

**Regra de Ouro:** O workflow não termina até que a task list esteja vazia, o código esteja provado em execução, e a memória institucional esteja totalmente gravada.
