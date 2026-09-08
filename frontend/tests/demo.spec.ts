import { test, expect } from '@playwright/test';

test.use({
  video: 'on',
  viewport: { width: 1440, height: 1050 }
});

test('capture portfolio demo', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your things. In good hands.' })).toBeVisible();

  const explore = page.getByRole('button', { name: 'Explore sample home' });
  if (await explore.isVisible().catch(() => false)) {
    await explore.click();
    await expect(page.locator('.stat').first()).not.toContainText('00');
  }

  await page.screenshot({ path: testInfo.outputPath('overview.png'), fullPage: true });

  await page.getByRole('link', { name: 'My things', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Meet the home team.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('assets.png'), fullPage: true });

  const firstAsset = page.locator('.assetcard').first();
  if (await firstAsset.count()) {
    await firstAsset.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: testInfo.outputPath('asset-detail.png'), fullPage: true });
  }

  await page.getByRole('link', { name: 'Care calendar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little love, right on time.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('care-calendar.png'), fullPage: true });

  await page.getByRole('link', { name: 'Recall watch', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A watchful little corner.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('recall-watch.png'), fullPage: true });
});
