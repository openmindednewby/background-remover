import { defineConfig } from 'vitest/config';
import { bgRemovalAssetsPlugin } from './scripts/bgRemovalAssets';

export default defineConfig({
  plugins: [bgRemovalAssetsPlugin(__dirname)],
  build: { outDir: 'dist', target: 'es2022' },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@dloizides/background-removal'] },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
