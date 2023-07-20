import { expect, test } from '@playwright/test'

test('should add a blog link to all pages', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { exact: true, name: 'Blog' })).toBeVisible()
})
