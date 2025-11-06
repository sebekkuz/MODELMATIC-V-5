FRONTEND NPM PATCH (no workspace:*)
----------------------------------

Files in this zip replace only package.json files and add a helper build script.
They remove all "workspace:*" references and use local file: deps for internal packages.

Apply:
1) Upload these files into your repo preserving paths:
   - apps/frontend/package.json
   - apps/frontend/.render-helpers/clean-install-build.sh
   - packages/schemas/package.json
   - packages/protocol/package.json
2) Commit to main.
3) In Render (Static Site prodsim-frontend):
   - Root Directory: apps/frontend
   - Build Command: bash .render-helpers/clean-install-build.sh
   - Publish Directory: dist
   - Clear build cache → Rebuild

Notes:
- Ensure apps/frontend/package-lock.json is NOT in the repo.
- If you keep using npm, do not commit any workspace:* strings anywhere in package.json files.
