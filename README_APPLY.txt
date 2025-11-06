
# Jak użyć (frontend)

1) Rozpakuj ten ZIP w katalogu repo tak, aby powstała ścieżka:
   `apps/frontend/.render-helpers/patch-workspace.js`

2) Otwórz `apps/frontend/package.json` i w sekcji `"scripts"` dodaj linię:
   "preinstall": "node .render-helpers/patch-workspace.js"

   Przykład (fragment):
   {
     "scripts": {
       "preinstall": "node .render-helpers/patch-workspace.js",
       "build": "vite build",
       "dev": "vite"
     }
   }

3) Usuń `apps/frontend/package-lock.json` (jeśli istnieje).

4) Commit + push na `main`.

5) W Render (Static Site):
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Clear build cache → Rebuild.

Preinstall odpali się **zanim** Render zainstaluje zależności i automatycznie
zamieni wszystkie `workspace:*` na ścieżki `file:` do lokalnych paczek oraz
doda `prepare` w pakietach TS, żeby zbudowały się podczas instalacji.
