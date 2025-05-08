// @ts-check
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://neuprint-dev.janelia.org:11000/?dataset=cns&qt=findneurons&q=1');
  await page.locator('.asyncSelect__input-container').click();
  await page.locator('#react-select-3-input').fill('10849');
});
