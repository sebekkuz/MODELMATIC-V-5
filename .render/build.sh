#!/usr/bin/env bash
set -euo pipefail

corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install --no-frozen-lockfile
pnpm -r build
