const { runDebate } = require('./debate');

if (require.main === module) {
  runDebate().catch(err => {
    console.error('Error executing debate loop:', err);
    process.exit(1);
  });
}
