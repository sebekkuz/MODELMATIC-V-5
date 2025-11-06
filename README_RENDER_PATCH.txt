PATCH PACK — Render (monorepo)

Files included:
1) .render/build-backend.sh
   - Install & build ONLY @prodsim/backend (prevents frontend preinstall from running during backend deploy).
   - In Render backend service set Build Command to:
       bash .render/build-backend.sh

2) .render/build-frontend.sh
   - Builds the frontend with PNPM at the repo root (workspace:* stays supported).
   - In Render static site (Root Directory: apps/frontend) set Build Command to:
       bash ../../.render/build-frontend.sh
     Publish Directory: apps/frontend/dist  (or just: dist if Root Directory is apps/frontend)

3) apps/frontend/.render-helpers/patch-workspace.cjs  (optional)
   - Only if you insist on using NPM for the static site, add to apps/frontend/package.json:
       "scripts": { "preinstall": "node ./.render-helpers/patch-workspace.cjs" }
   - This converts "workspace:*" deps to local file: paths so NPM can install them.
   - Not needed if you use PNPM as in (2).

Steps:
- Drop the contents of this ZIP into the REPO ROOT (paths must match).
- Backend service → Build Command: bash .render/build-backend.sh
- Frontend static site → Build Command: bash ../../.render/build-frontend.sh
