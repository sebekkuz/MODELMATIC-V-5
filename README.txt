Podmiana bez workspace:* (frontend + lokalne paczki):
1) Skopiuj te trzy pliki do repo, zachowując ścieżki:
   - apps/frontend/package.json
   - packages/schemas/package.json
   - packages/protocol/package.json
2) Commit na main.
3) W Static Site:
   - Root Directory: apps/frontend
   - Build Command: npm ci --no-audit --no-fund && npm run build
   - Publish Directory: dist
   - Clear build cache -> Rebuild

Uwaga: 'postinstall' w frontendzie zbuduje packages/schemas oraz packages/protocol przed 'vite build'.
