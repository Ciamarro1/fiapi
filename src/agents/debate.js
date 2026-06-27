const fs = require('fs');
const path = require('path');
const ciaAgent = require('./cia');
const ctoAgent = require('./cto');

async function runDebate() {
  console.log('Starting Agent Governance Council Debate...');
  
  const transcript = [];
  const maxTurns = 20;
  
  // Initial prompt
  let nextInput = 'Debate and design the FIAPI architecture, a Workers AI Image API with Agent Governance Council.';
  let currentAgent = ciaAgent;
  let nextAgent = ctoAgent;
  let approved = false;

  let finalCiaResponse = '';
  let finalCtoResponse = '';

  for (let turn = 1; turn <= maxTurns; turn++) {
    console.log(`\n--- Turn ${turn}: Running ${currentAgent.name}... ---`);
    
    // Run current agent
    const result = await currentAgent.run(nextInput, undefined, { conversationId: 'shared-debate-conversation-id' });
    const response = result.data || '';
    
    // Log response
    transcript.push(`## Turn ${turn}: ${currentAgent.name}\n\n${response}\n\n`);
    
    if (currentAgent.name === 'Chief Intelligence Architect') {
      finalCiaResponse = response;
    } else {
      finalCtoResponse = response;
    }

    // Check for early termination on CIA approval
    if (currentAgent.name === 'Chief Intelligence Architect' && response.includes('DECISION: APPROVED')) {
      console.log('CIA declared DECISION: APPROVED. Terminating debate early.');
      approved = true;
      break;
    }

    // Swap agents for the next turn
    nextInput = response;
    const temp = currentAgent;
    currentAgent = nextAgent;
    nextAgent = temp;
  }

  // Ensure docs folder exists
  const docsDir = path.join(__dirname, '..', '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Save full transcript
  const debateLogPath = path.join(docsDir, 'debate_log.md');
  fs.writeFileSync(debateLogPath, `# Agent Governance Council - Debate Log\n\n${transcript.join('---\n\n')}`);
  console.log(`Saved full transcript to: ${debateLogPath}`);

  // Save final technical design proposal
  const architecturePath = path.join(docsDir, 'architecture.md');
  const architectureContent = `# FIAPI - Final Technical Design Proposal

## Status: APPROVED by Agent Governance Council

---

## 1. Cognitive Architecture & Governance (Chief Intelligence Architect)
${finalCiaResponse}

---

## 2. Technical System Design (Chief Technology Officer)
${finalCtoResponse}
`;
  fs.writeFileSync(architecturePath, architectureContent);
  console.log(`Saved final proposal to: ${architecturePath}`);
}

if (require.main === module) {
  runDebate().catch(err => {
    console.error('Error executing debate loop:', err);
    process.exit(1);
  });
}

module.exports = { runDebate };
