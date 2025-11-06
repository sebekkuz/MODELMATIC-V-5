Patch for Render build:
- Adds CommonJS helper to replace `workspace:*` deps in apps/frontend/package.json.
- Use it by adding this script to apps/frontend/package.json:
    "scripts": {
      "preinstall": "node ./.render-helpers/patch-workspace.cjs"
    }
