import { expect, test } from './test'

test.describe('preview', () => {
  test('renders the preview component from blog data', async ({ page }) => {
    await page.goto('/guides/components/')

    const preview = page.getByRole('main').getByRole('article')

    await expect(preview.getByRole('heading', { level: 2, name: 'Vario nunc polo' })).toBeVisible()
    await expect(preview.locator('header > .preview-link')).toHaveAttribute('href', '/blog/vario-nunc-polo/')
    await expect(preview.getByRole('link', { exact: true, name: 'Placeholder' })).toHaveAttribute(
      'href',
      '/blog/tags/placeholder/',
    )
  })

  test.describe('i18n', () => {
    test('renders localized for a fallback post', async ({ page }) => {
      await page.goto('/fr/guides/components/')

      const preview = page.getByRole('main').getByRole('article')

      await expect(preview.getByRole('heading', { level: 2, name: 'Vario nunc polo' })).toBeVisible()
      await expect(preview.locator('header > .preview-link')).toHaveAttribute('href', '/fr/blog/vario-nunc-polo/')
      await expect(preview.getByRole('link', { exact: true, name: 'Placeholder' })).toHaveAttribute(
        'href',
        '/fr/blog/tags/placeholder/',
      )
    })
  })
})
