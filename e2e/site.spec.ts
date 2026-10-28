import { expect, test, type Page, type Request } from '@playwright/test';

const MIN_HIT = 44;
const CUT_TIMEOUT_MS = 120_000;

interface Seen {
  url: string;
  method: string;
  bodyBytes: number;
}

async function fitProblems(page: Page): Promise<{ small: string[]; overflow: string[]; hScroll: number }> {
  return page.evaluate((min) => {
    const visible = (e: Element): boolean => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const controls = [...document.querySelectorAll('button, a, input:not([type=file]), label')].filter(visible);
    const small = controls.filter((e) => { const r = e.getBoundingClientRect(); return r.width < min || r.height < min; }).map((e) => e.outerHTML.slice(0, 60));
    const texts = [...document.querySelectorAll('button, a, label, h1, p, span')].filter(visible);
    const overflow = texts.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline').map((e) => e.textContent ?? '');
    return { small, overflow, hScroll: document.documentElement.scrollWidth - window.innerWidth };
  }, MIN_HIT);
}

test('empty state opens on Choose photo, every control is at least 44 px, text fits and nothing scrolls sideways', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('choose')).toBeFocused();
  expect(await fitProblems(page)).toEqual({ small: [], overflow: [], hScroll: 0 });
});

test('a photo is cut on the device: Download PNG gets focus, the tool row is aligned, and no request carries image bytes', async ({ page, baseURL }) => {
  test.setTimeout(CUT_TIMEOUT_MS * 2);
  await page.route('https://analytics.dloizides.com/**', (r) => r.abort());
  await page.goto('/');
  const photo = await page.screenshot({ type: 'png' });
  const seen: Seen[] = [];
  page.on('request', (r: Request) => seen.push({ url: r.url(), method: r.method(), bodyBytes: r.postDataBuffer()?.length ?? 0 }));

  await page.getByTestId('file').setInputFiles({ name: 'room.png', mimeType: 'image/png', buffer: photo });
  await expect(page.getByTestId('download')).toBeEnabled({ timeout: CUT_TIMEOUT_MS });

  await expect(page.getByTestId('download')).toBeFocused();
  await expect(page.getByTestId('status')).toContainText('Background removed in');
  expect(await fitProblems(page)).toEqual({ small: [], overflow: [], hScroll: 0 });
  const tops = await page.getByTestId('tools').evaluate((row) => [...row.children].map((c) => Math.round(c.getBoundingClientRect().height)));
  expect(new Set(tops)).toEqual(new Set([MIN_HIT]));
  const box = await page.getByTestId('canvas').boundingBox();
  const [x, y] = [(box?.x ?? 0) + (box?.width ?? 0) * 0.75, (box?.y ?? 0) + (box?.height ?? 0) * 0.25];
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 10, y + 10);
  await page.mouse.up();
  await expect(page.locator('#undo')).toBeEnabled();
  const download = page.waitForEvent('download');
  await page.getByTestId('download').click();
  expect((await download).suggestedFilename()).toBe('room-cutout.png');
  const leaks = seen.filter((r) => r.method !== 'GET' || r.bodyBytes > 0 || !(r.url.startsWith(baseURL ?? '-') || r.url.startsWith('blob:') || r.url.startsWith('https://analytics.dloizides.com/')));
  expect(seen.some((r) => r.url.includes('/bg-removal/'))).toBe(true);
  expect(leaks).toEqual([]);
});
