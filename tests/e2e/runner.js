const { spawn } = require('child_process');
const path = require('path');

const PORT = 8787;
const BASE_URL = `http://localhost:${PORT}`;

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_FILE = path.join(PROJECT_ROOT, 'tests/e2e/e2e.test.js');

async function main() {
  console.log('Starting wrangler dev server...');
  
  // Set environment variables for wrangler dev
  const devEnv = {
    ...process.env,
    PATH: 'C:\\Program Files\\nodejs;' + (process.env.PATH || ''),
    MOCK_AI: 'true',
    AUTH_TOKEN: 'test-token',
    WRANGLER_SEND_METRICS: 'false',
    CI: 'true'
  };

  const isWin = process.platform === 'win32';
  const npxCmd = isWin ? 'npx.cmd' : 'npx';

  // wrangler dev --port 8787
  const wranglerProcess = spawn(npxCmd, ['wrangler', 'dev', '--port', String(PORT)], {
    cwd: PROJECT_ROOT,
    env: devEnv,
    shell: true
  });

  // Log wrangler output to console for debugging if needed
  wranglerProcess.stdout.on('data', (data) => {
    // console.log(`[Wrangler STDOUT] ${data.toString()}`);
  });

  wranglerProcess.stderr.on('data', (data) => {
    // console.error(`[Wrangler STDERR] ${data.toString()}`);
  });

  wranglerProcess.on('error', (err) => {
    console.error('Failed to start wrangler dev:', err);
    process.exit(1);
  });

  let terminated = false;
  async function terminateServer() {
    if (terminated) return;
    terminated = true;
    console.log('Terminating wrangler dev server...');
    
    return new Promise((resolve) => {
      if (isWin) {
        // Use taskkill to kill the whole process tree on Windows
        const kill = spawn('taskkill', ['/pid', String(wranglerProcess.pid), '/f', '/t']);
        kill.on('exit', () => resolve());
      } else {
        wranglerProcess.kill('SIGTERM');
        wranglerProcess.on('exit', () => resolve());
      }
    });
  }

  // Poll /health endpoint
  console.log('Polling /health endpoint to verify server is online...');
  const maxAttempts = 60;
  const pollIntervalMs = 500;
  let serverOnline = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status === 200) {
        const body = await res.json();
        if (body.status === 'ok') {
          serverOnline = true;
          break;
        }
      }
    } catch (err) {
      // Ignore network errors during startup
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  if (!serverOnline) {
    console.error('Wrangler dev server failed to start within the timeout period.');
    await terminateServer();
    process.exit(1);
  }

  console.log('Server is online! Running E2E test suite...');

  // Spawn test suite process
  const testProcess = spawn(process.execPath, [TEST_FILE], {
    cwd: PROJECT_ROOT,
    env: devEnv,
    stdio: 'inherit'
  });

  testProcess.on('exit', async (code) => {
    console.log(`Test suite exited with code ${code}`);
    await terminateServer();
    process.exit(code === null ? 1 : code);
  });
}

main().catch(async (err) => {
  console.error('Unhandled error in runner:', err);
  process.exit(1);
});
