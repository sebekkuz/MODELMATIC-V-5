KROK PO KROKU (naprawa 'workspace:*' dla frontendu na Render):

1) Skopiuj pliki do repo (zachowaj ścieżki):
   - apps/frontend/package.json
   - packages/schemas/package.json
   - packages/protocol/package.json
   - apps/frontend/.render-helpers/clean-install-build.sh

2) Commit na 'main'.

3) W Static Site (prodsim-frontend) ustaw:
   - Root Directory: apps/frontend
   - Build Command: bash .render-helpers/clean-install-build.sh
   - Publish Directory: dist
   - Clear build cache -> Rebuild

Uwagi:
- Skrypt sam usuwa apps/frontend/package-lock.json przed instalacją.
- 'postinstall' w frontendzie buduje lokalne paczki @prodsim/schemas i @prodsim/protocol.
