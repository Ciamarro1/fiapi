---
name: Autonomous Cognitive Factory & Teamwork Swarm (Merged Governance)
description: Combines interactive prompt drafting & integrity enforcement (Teamwork) with 20-iteration Cognitive Governance debate (CIA vs CTO vs Ponytail) and relentless multi-agent swarm execution through the 8 pillars of the Lyzer Factory.
trigger: /cg
---
# Unified Cognitive Governance & Teamwork Factory Workflow (/cg)

Este workflow funde a inteligência de alinhamento e verificação objetiva do **Teamwork System** com o rigor cognitivo do **Cognitive Governance Council (CIA x CTO x Ponytail)** e a força bruta de execução da **Fábrica Autônoma de Software (8 Pilares)**.

---

## 🎯 FILOSOFIA DE EXECUÇÃO: A LEI DE SISYPHUS & DELEGAÇÃO TOTAL
Lance a IA no problema com ferramentas pesadas e deixe a swarm moer em segundo plano até terminar. Foco obsessivo em não parar até que a lista de TODOs esteja vazia, os testes E2E estejam provados por execução, o gatekeeper de segurança autorize o commit/push remoto e a memória institucional esteja gravada.

---

## 📋 FASE 1: ALINHAMENTO COGNITIVO & DRAFT DE PROMPT (TEAMWORK SYSTEM)
Quando acionado via `/cg [Ideia/Problema]`:

1. **Rascunho de Prompt e Artefato em Tempo Real:**
   - O agente cria imediatamente o artefato `prompt_draft.md` contendo a descrição da missão, diretório de trabalho, requisitos e critérios de aceitação objetivos.
2. **Resolução de Ambiguidades e Modo de Integridade:**
   - O agente utiliza perguntas interativas (`ask_question`) para definir a escala, restrições de tecnologia e modo de integridade (`development`, `demo`, `benchmark`).
3. **Aprovação do Humano:**
   - O usuário revisa e aprova o plano com um sinal limpo (`Proceed` / `Go`).

---

## 🏛️ FASE 2: O DEBATE DE GOVERNANÇA (20 ITERAÇÕES ARQUITETURAIS)
Após a aprovação do prompt, o comitê de IA assume o controle para definir o significado e o sistema:

1. **Iterações 1 a 15 (CIA x CTO):**
   - **CIA (Chief Intelligence Architect):** Executa o *Cognitive Snapshot* (Fases 0 a 4: Semântica, Epistemologia, Ontologia e Modelos de Observador). Destrói ambiguidades e drift semântico.
   - **CTO (Chief Technology Officer):** Traduz o intent cognitivo para arquitetura técnica confiável, escalável e observável.
2. **Iterações 16 a 20 (A Injeção do Ponytail):**
   - Nas últimas 5 iterações, o subagente **Ponytail (O Bisturi de Simplicidade)** é injetado no debate.
   - **Missão do Ponytail:** Destruir a complexidade gerada pelo CIA e CTO, forçando a solução mais simples, mais nativa e mais resiliente que satisfaça a demanda.
3. **Consolidação de Artefatos:**
   - Geração automática de `docs/debate_log.md` e `docs/architecture.md`.

---

## 🏭 FASE 3: A ESTEIRA DE EXECUÇÃO AUTÔNOMA (OS 8 PILARES DA FÁBRICA SWARM)
Com a arquitetura selada, o sistema dispara a swarm de subagentes especializados (`teamwork_preview` / parallel workers) operando sob 8 pilares:

1. **Orquestração Multi-Agente Swarm:** O CTO divide as missões e lança trabalhadores em paralelo (Explorers para pesquisa, Implementers para código, Reviewers/Challengers para auditoria).
2. **Memória Institucional:** Gravação permanente de ADRs e convenções na pasta `.agents/memory/` e em `docs/`.
3. **Raio de Impacto Sintático (AST):** Consulta topológica via `code-review-graph` para garantir zero breaking changes em módulos core.
4. **Verificação Contínua por Execução:** Automação de testes de unidade e testes E2E (`npm run test:e2e`). Código só é considerado feito se a execução provar que funciona.
5. **Red Teaming & Testes Adversários:** Invocação do Blue Team (CIA/CTO) vs Red Team (CAA/ACTO) para testes de estresse, concorrência e exploração de limites.
6. **Evolução de Procedimentos (SOPs):** Extração de novos padrões repetitivos em novas `SKILL.md` via `skillify`.
7. **Pre-Push Security Gatekeeper:** Escaneamento rigoroso contra vaziamento de credenciais, chaves de API ou segredos antes de qualquer commit/push git.
8. **Gravação de Estado (Final Checkpoint):** Consolidação obrigatória do estado do projeto e atualização da memória antes de encerrar o ciclo.

---

**Regra de Ouro:** O workflow não termina até que a task list esteja vazia, o código esteja provado por execução, o push remoto tenha sido concluído com sucesso e a memória institucional esteja gravada.
