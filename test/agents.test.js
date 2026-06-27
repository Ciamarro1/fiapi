const assert = require('assert');
const { FallbackModelProvider } = require('../src/agents/model-provider');
const ciaAgent = require('../src/agents/cia');
const ctoAgent = require('../src/agents/cto');

function testFallbackModelProvider() {
  console.log('Running testFallbackModelProvider...');
  const provider = new FallbackModelProvider();
  
  assert.strictEqual(provider.getProviderName(), 'fallback-model-provider');
  assert.strictEqual(provider.getDefaultModel(), '@cf/meta/llama-3-8b-instruct');
  assert.strictEqual(provider.supportsTools(), true);
  assert.strictEqual(provider.supportsStreaming(), true);
  
  // Test simulated completion for CIA
  const ciaParams = {
    messages: [
      { role: 'system', content: 'You are the Chief Intelligence Architect (CIA)' },
      { role: 'user', content: 'Hello' }
    ]
  };
  const ciaResult = provider.simulateCompletion(ciaParams);
  assert.strictEqual(ciaResult.object, 'chat.completion');
  assert.ok(ciaResult.choices[0].message.content.includes('Observer Analysis'));
  
  // Test simulated completion for CTO
  const ctoParams = {
    messages: [
      { role: 'system', content: 'You are the Senior Chief Technology Officer (CTO)' },
      { role: 'user', content: 'Hello' }
    ]
  };
  const ctoResult = provider.simulateCompletion(ctoParams);
  assert.strictEqual(ctoResult.object, 'chat.completion');
  assert.ok(ctoResult.choices[0].message.content.includes('Technical Situation'));
  
  console.log('testFallbackModelProvider passed.');
}

function testAgentConfiguration() {
  console.log('Running testAgentConfiguration...');
  
  assert.strictEqual(ciaAgent.name, 'Chief Intelligence Architect');
  assert.strictEqual(ctoAgent.name, 'Chief Technology Officer');
  
  assert.ok(ciaAgent.config.instructions.includes('Chief Intelligence Architect'));
  assert.ok(ctoAgent.config.instructions.includes('Chief Technology Officer'));
  
  assert.ok(ciaAgent.config.memory);
  assert.ok(ctoAgent.config.memory);
  
  console.log('testAgentConfiguration passed.');
}

function runAllTests() {
  try {
    testFallbackModelProvider();
    testAgentConfiguration();
    console.log('\nAll tests passed successfully!');
  } catch (err) {
    console.error('Test validation failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}
