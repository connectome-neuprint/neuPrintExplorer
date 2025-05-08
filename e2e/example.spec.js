// @ts-check
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://neuprint-dev.janelia.org:11000/?dataset=cns&qt=findneurons&q=1');
  await expect(page.getByRole('main')).toContainText('Analysis tools for connectomics and more');
  await page.locator('.asyncSelect__input-container').click();
  await page.locator('#search-neuron-input').fill('10849');
  await expect(page.locator('.asyncSelect__menu')).toContainText('10849');
  await page.locator('.asyncSelect__input-container').click();
  await page.locator('#search-neuron-input').fill('GNG117');
  await expect(page.locator('.asyncSelect__menu')).toContainText('GNG117');
});
