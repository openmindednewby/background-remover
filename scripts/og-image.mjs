import console from 'node:console';
import sharp from 'sharp';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SharpRasterizer, generateOgImages, nodeFileSystem } from '@dloizides/og-image-generator';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const at = (rel) => resolve(root, rel);

await generateOgImages(
  [{ src: at('scripts/og-card.svg'), dst: at('public/og-image.png'), width: 1200, height: 630, fit: 'cover' }],
  { rasterizer: new SharpRasterizer(sharp), fs: nodeFileSystem, logger: console },
);
