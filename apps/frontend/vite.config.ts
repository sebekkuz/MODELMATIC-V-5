import { defineConfig } from 'vite';
import path from 'node:path';

// Plugin-less React build: rely on esbuild's JSX transform
export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  }
});
