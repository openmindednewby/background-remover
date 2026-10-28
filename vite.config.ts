import { bgRemovalAssetsPlugin } from '@dloizides/background-removal/vite';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { cspFromNginx } from './scripts/csp';

const csp = cspFromNginx(readFileSync(new URL('./nginx.conf', import.meta.url), 'utf8'));

export default defineConfig({
  plugins: [bgRemovalAssetsPlugin()],
  build: { outDir: 'dist', target: 'es2022' },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@dloizides/background-removal'] },
  preview: { headers: { 'Content-Security-Policy': csp } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
