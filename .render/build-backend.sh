#!/usr/bin/env bash
set -euo pipefail

# Ensure pnpm is available
corepack enable
corepack prepare pnpm@9.12.0 --activate

# Install only the backend workspace and its dependencies (avoid triggering scripts in other workspaces)
pnpm install --no-frozen-lockfile --filter @prodsim/backend...

# Build backend only
pnpm --filter @prodsim/backend build
