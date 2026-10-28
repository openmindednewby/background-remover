# Background remover

https://background-remover.dloizides.com/ cuts the background out of a photo in the browser.
The photo never leaves the device: `@dloizides/background-removal` runs an Apache-2.0 MODNet
model in onnxruntime-web inside a Web Worker. The model (25.9 MB) and the onnxruntime jsep pair
(29.5 MB) are served from this origin under `/bg-removal/<version>/` with an immutable cache.

Scaffolded with `manage.sh scaffold-landing background-remover` (QUAL-SCAFFOLD-1 "New apps only
from the scaffolder"), then Vite + TypeScript added. Layout C "Compare" (BGREMOVE-1 D4); design,
critiques and pick page in `docs/design/`, focus ledger in `docs/focus-ledger.md`.

| Command | What |
|---|---|
| `npm run lint` / `npm run typecheck` / `npm test` | eslint, tsc, vitest |
| `npm run build` | `dist/` incl. model + runtime (54 MB) |
| `npm run test:e2e` | Playwright 360x640 + 1280x800: initial focus, 44 px boxes, text fit, no sideways scroll, AC-2 no image bytes leave |
| `CAPTURE_DIR=<dir> npx playwright test e2e/capture.spec.ts` | empty + cut captures |

Deploy: `personalServerNotes/scripts/deploy-from-box.sh background-remover`.
