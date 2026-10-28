import { expect, test } from '@playwright/test';

const OUT = process.env.CAPTURE_DIR ?? '';
const CUT_TIMEOUT_MS = 120_000;

test.skip(OUT === '', 'set CAPTURE_DIR to write the empty and cut captures');

test('captures the empty and cut states for visual review', async ({ page }, info) => {
  test.setTimeout(CUT_TIMEOUT_MS * 2);
  await page.route('https://analytics.dloizides.com/**', (r) => r.abort());
  await page.goto('/');
  await page.screenshot({ path: `${OUT}/empty-${info.project.name}.png`, fullPage: true });
  const photo = await page.screenshot({ type: 'png' });

  await page.getByTestId('file').setInputFiles({ name: 'room.png', mimeType: 'image/png', buffer: photo });

  await expect(page.getByTestId('download')).toBeEnabled({ timeout: CUT_TIMEOUT_MS });
  await page.screenshot({ path: `${OUT}/cut-${info.project.name}.png`, fullPage: true });
});
