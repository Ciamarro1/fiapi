const { Agent, InMemoryMemory } = require('@ag-kit/agents');
const { FallbackModelProvider } = require('./model-provider');
const fs = require('fs');
const path = require('path');

const promptPath = 'C:\\Users\\WDAGUtilityAccount\\Downloads\\lyzer-labs-cto-v3.md';
const ctoInstructions = fs.readFileSync(promptPath, 'utf8');

const provider = new FallbackModelProvider();

const ctoMemory = new InMemoryMemory({
  sessionId: 'debate-session-cto',
  enableContextManagement: true,
  thresholds: {
    preRotThreshold: 4000,
    compactionTrigger: 0.8,
    summarizationTrigger: 0.6,
    recentToKeep: 10
  }
});

const ctoAgent = new Agent({
  name: 'Chief Technology Officer',
  description: 'Senior Chief Technology Officer of Lyzer Labs',
  model: provider,
  instructions: ctoInstructions,
  memory: ctoMemory,
  modelSettings: {
    temperature: 0.7,
    maxTokens: 2048
  }
});

module.exports = ctoAgent;
