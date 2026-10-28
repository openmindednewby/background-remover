import { copyFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

const RUNTIME_FILE = /^ort-wasm-simd-threaded\.jsep\.(wasm|mjs)$/;
const BUNDLED_ORT_WASM = /^assets\/ort-wasm-[^/]*\.wasm$/;
const MODEL = 'modnet.onnx';

const versionOf = (dir: string): string => (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { version: string }).version;

function assetMap(root: string): { urls: { modelUrl: string; runtimeBaseUrl: string }; byUrl: Map<string, string> } {
  const pkgDir = join(root, 'node_modules', '@dloizides', 'background-removal');
  const ortRoot = join(root, 'node_modules', 'onnxruntime-web');
  const urls = { modelUrl: `/bg-removal/${versionOf(pkgDir)}/${MODEL}`, runtimeBaseUrl: `/bg-removal/ort/${versionOf(ortRoot)}/` };
  const runtime = readdirSync(join(ortRoot, 'dist')).filter((f) => RUNTIME_FILE.test(f));
  const pairs = runtime.map((f): [string, string] => [`${urls.runtimeBaseUrl}${f}`, join(ortRoot, 'dist', f)]);
  return { urls, byUrl: new Map([[urls.modelUrl, join(pkgDir, 'models', MODEL)], ...pairs]) };
}

/** Serves the model and the jsep runtime pair from our own origin in dev and copies them into dist at build. */
export function bgRemovalAssetsPlugin(root: string): Plugin {
  const { urls, byUrl } = assetMap(root);
  let outDir = 'dist';
  return {
    name: 'bg-removal-assets',
    config: () => ({ define: { __BG_REMOVAL_URLS__: JSON.stringify(urls) } }),
    configResolved: (config) => { outDir = config.build.outDir; },
    generateBundle: {
      order: 'post',
      handler: (_options, bundle) => { for (const f of Object.keys(bundle).filter((n) => BUNDLED_ORT_WASM.test(n))) delete bundle[f]; },
    },
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        const file = byUrl.get(req.url ?? '');
        if (file === undefined) return next();
        if (file.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        res.end(readFileSync(file));
      });
    },
    writeBundle: () => {
      for (const [url, from] of byUrl) {
        const target = join(root, outDir, url.slice(1));
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(from, target);
      }
    },
  };
}
