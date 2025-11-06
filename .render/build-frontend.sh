#!/usr/bin/env bash
set -euo pipefail

# This script can be invoked from anywhere; always jump to repo root (script's parent dir's parent)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

corepack enable
corepack prepare pnpm@9.12.0 --activate

# Install & build all needed packages (workspace protocol is supported by pnpm)
pnpm install --no-frozen-lockfile
pnpm --filter @prodsim/frontend... build
