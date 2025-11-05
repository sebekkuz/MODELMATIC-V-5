# Render Build Fix
Użyj jednej z opcji:

1) **UI (jedna linia z `&&`)** – w polu *Build Command* wpisz:
```
corepack enable && corepack prepare pnpm@9.12.0 --activate && pnpm install --no-frozen-lockfile && pnpm -r build
```

2) **Skrypt** – dodaj plik `.render/build.sh` do repo i ustaw *Build Command* na:
```
bash .render/build.sh
```
