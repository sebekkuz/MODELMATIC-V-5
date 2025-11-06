// CommonJS helper to patch "workspace:*" deps when building with npm (not needed with pnpm)
// Usage in apps/frontend/package.json (optional):
//   "scripts": { "preinstall": "node ./.render-helpers/patch-workspace.cjs" }
const fs = require('fs');
const path = require('path');

const pjPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

const mapping = {
  '@prodsim/schemas': 'file:../../packages/schemas',
  '@prodsim/protocol': 'file:../../packages/protocol',
  '@prodsim/utils': 'file:../../packages/utils'
};

function fix(obj) {
  if (!obj) return;
  for (const [name, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.startsWith('workspace:')) {
      obj[name] = mapping[name] || '*';
    }
  }
}
fix(pkg.dependencies);
fix(pkg.devDependencies);

fs.mkdirSync(path.join(process.cwd(), '.render-helpers'), { recursive: true });
fs.writeFileSync(pjPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('Patched workspace:* in', pjPath);
