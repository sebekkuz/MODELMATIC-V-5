/**
 * patch-workspace.js
 * Run as a preinstall script in apps/frontend to replace `workspace:*`
 * with local file: paths and add `prepare` to local ts packages.
 * This runs before npm actually installs dependencies on Render.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd(); // apps/frontend
const log = (...args) => console.log('[preinstall-patch]', ...args);

// Map package name -> relative path from apps/frontend
const localMap = {
  '@prodsim/schemas': '../../packages/schemas',
  '@prodsim/protocol': '../../packages/protocol',
  '@prodsim/utils': '../../packages/utils'
};

function safeReadJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return null; }
}
function safeWriteJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function patchDeps(obj, filePath) {
  let changed = false;
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = obj[section];
    if (!deps) continue;
    for (const [name, ver] of Object.entries(deps)) {
      if (typeof ver === 'string' && ver.startsWith('workspace:')) {
        // If we know a local path, convert to file:
        if (localMap[name]) {
          deps[name] = `file:${localMap[name]}`;
          changed = true;
          log(`Replaced ${name}@${ver} -> ${deps[name]} in ${filePath}`);
        } else {
          // Fallback: strip the 'workspace:' prefix to just version (may be '*')
          deps[name] = ver.replace(/^workspace:/, '');
          changed = true;
          log(`Stripped workspace: for ${name}@${ver} -> ${deps[name]} in ${filePath}`);
        }
      }
    }
  }
  return changed;
}

// Patch frontend package.json first (cwd)
const frontendPkgPath = path.join(root, 'package.json');
const frontendPkg = safeReadJSON(frontendPkgPath);
if (frontendPkg) {
  if (!frontendPkg.scripts) frontendPkg.scripts = {};
  // ensure THIS script stays as preinstall so it will run on Render
  frontendPkg.scripts['preinstall'] = 'node .render-helpers/patch-workspace.js';
  // also replace any lingering workspace:* here
  const changed = patchDeps(frontendPkg, 'apps/frontend/package.json');
  safeWriteJSON(frontendPkgPath, frontendPkg);
  if (!changed) log('No workspace:* found in frontend package.json (ok).');
}

// Patch local packages that frontend may reference
const targets = [
  path.join(root, '../../packages/protocol/package.json'),
  path.join(root, '../../packages/schemas/package.json'),
  path.join(root, '../../packages/utils/package.json')
];

for (const pkgPath of targets) {
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = safeReadJSON(pkgPath);
  if (!pkg) continue;
  const changed = patchDeps(pkg, pkgPath);
  // Ensure prepare builds TS on install (so dist exists when Vite bundles)
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.prepare) {
    // Prefer an existing build script if present
    if (pkg.scripts.build) {
      pkg.scripts.prepare = 'npm run build';
    } else {
      pkg.scripts.prepare = 'tsc -p tsconfig.json';
    }
    log(`Added prepare script to ${pkgPath}: "${pkg.scripts.prepare}"`);
  }
  // keep main/types if already present; don't overwrite
  safeWriteJSON(pkgPath, pkg);
}

log('Patch complete.');
