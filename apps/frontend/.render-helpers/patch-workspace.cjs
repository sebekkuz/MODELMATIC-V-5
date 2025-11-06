#!/usr/bin/env node
/**
 * Patch "workspace:*" deps in apps/frontend/package.json to registry versions
 * derived from local packages in ../../packages/*.
 * Safe to run multiple times; it only rewrites 'workspace:*' entries.
 */
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const helpersDir = __dirname; // .../apps/frontend/.render-helpers
const frontendDir = path.resolve(helpersDir, '..');
const repoRoot = path.resolve(frontendDir, '..', '..');

// Collect versions from local @prodsim/* packages
const pkgs = ['protocol', 'schemas', 'utils', 'sim-engine'];
const versions = {};
for (const name of pkgs) {
  const p = path.join(repoRoot, 'packages', name, 'package.json');
  if (fs.existsSync(p)) {
    try {
      const v = readJSON(p).version;
      versions[`@prodsim/${name}`] = v;
    } catch {}
  }
}

const frontendPkgPath = path.join(frontendDir, 'package.json');
if (!fs.existsSync(frontendPkgPath)) {
  console.error('Cannot find apps/frontend/package.json');
  process.exit(0);
}

const pkg = readJSON(frontendPkgPath);

function patch(deps) {
  if (!deps) return false;
  let touched = false;
  for (const k of Object.keys(deps)) {
    const v = deps[k];
    if (typeof v === 'string' && v.startsWith('workspace:')) {
      const localV = versions[k];
      const newV = localV ? `^${localV}` : '*';
      if (deps[k] !== newV) {
        deps[k] = newV;
        touched = true;
      }
    }
  }
  return touched;
}

const changed =
  patch(pkg.dependencies) |
  patch(pkg.devDependencies) |
  patch(pkg.peerDependencies);

if (changed) {
  fs.writeFileSync(frontendPkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Patched workspace:* to concrete versions in apps/frontend/package.json');
} else {
  console.log('Nothing to patch; no workspace:* deps found.');
}
