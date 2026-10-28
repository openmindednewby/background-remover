const SUPPORTED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MS_PER_S = 1000;
const PERCENT = 100;

/** True when the file is a photo type we cut. */
export function isSupportedImage(type: string): boolean {
  return SUPPORTED.has(type);
}

/** The download name: the photo base name with "-cutout.png". */
export function cutoutName(fileName: string): string {
  const base = fileName.replace(/\.[^./\\]+$/, '').trim();
  return `${base === '' ? 'photo' : base}-cutout.png`;
}

/** Elapsed milliseconds as seconds with one decimal. */
export function seconds(ms: number): string {
  return (ms / MS_PER_S).toFixed(1);
}

/** Clamps a compare split to 0..100 percent. */
export function clampSplit(value: number): number {
  return Number.isFinite(value) ? Math.min(PERCENT, Math.max(0, value)) : PERCENT / 2;
}

/** Pushes a mask snapshot, dropping the oldest beyond the limit. */
export function pushSnapshot<T>(stack: readonly T[], snapshot: T, limit: number): T[] {
  const next = [...stack, snapshot];
  return next.length > limit ? next.slice(next.length - limit) : next;
}
