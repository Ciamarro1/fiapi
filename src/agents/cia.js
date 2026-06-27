const { Agent, InMemoryMemory } = require('@ag-kit/agents');
const { FallbackModelProvider } = require('./model-provider');
const fs = require('fs');
const path = require('path');

const promptPath = 'C:\\Users\\WDAGUtilityAccount\\Downloads\\CIA.txt';
const ciaInstructions = fs.readFileSync(promptPath, 'utf8');

const provider = new FallbackModelProvider();

const ciaMemory = new InMemoryMemory({
  sessionId: 'debate-session-cia',
  enableContextManagement: true,
  thresholds: {
    preRotThreshold: 4000,
    compactionTrigger: 0.8,
    summarizationTrigger: 0.6,
    recentToKeep: 10
  }
});

const ciaAgent = new Agent({
  name: 'Chief Intelligence Architect',
  description: 'Chief Intelligence Architect of Lyzer Labs',
  model: provider,
  instructions: ciaInstructions,
  memory: ciaMemory,
  modelSettings: {
    temperature: 0.7,
    maxTokens: 2048
  }
});

module.exports = ciaAgent;
