const { execSync } = require('child_process');
try {
  execSync('pnpm exec tsc --noEmit -p tsconfig.json', { stdio: 'pipe' });
  console.log('TS passed');
} catch (e) {
  console.log('TS failed');
  console.log(e.stdout.toString());
}
