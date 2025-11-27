import { expect, test } from './test'

test('should display a preview of each posts from a specific author', async ({ authorsPage }) => {
  const authors: [author: string, slug: string, count: number][] = [
    ['Ghost', 'ghost', 6],
    ["Bob O'Alice", 'bob-oalice', 1],
  ]

  for (const [author, slug, count] of authors) {
    await authorsPage.goto(slug)

    await expect(
      authorsPage.content.getByText(`${count} post${count > 1 ? 's' : ''} by ${author}`, { exact: true }),
    ).toBeVisible()

    const articles = authorsPage.content.getByRole('article')

    expect(await articles.count()).toBe(count)
  }
})

test('should not include draft blog posts', async ({ authorsPage }) => {
  const author = 'HiDeoo'
  const count = 10

  await authorsPage.goto(author.toLowerCase())

  await expect(authorsPage.content.getByText(`${count} posts by ${author}`, { exact: true })).toBeVisible()

  const articles = authorsPage.content.getByRole('article')

  expect(await articles.count()).toBe(count)
})

test('should not display a link to edit this page', async ({ authorsPage }) => {
  await authorsPage.goto('astro')

  await expect(authorsPage.content.getByText('Edit page')).not.toBeVisible()
})

test('should not generate pages for authors with only draft blog posts', async ({ authorsPage }) => {
  const response = await authorsPage.goto('unknown')

  expect(response?.ok()).toBe(false)
})

test('should not include Starlight pagination links', async ({ authorsPage }) => {
  await authorsPage.goto('hideoo')

  await expect(authorsPage.content.locator('.pagination-links a[rel="prev"]')).not.toBeVisible()
  await expect(authorsPage.content.locator('.pagination-links a[rel="next"]')).not.toBeVisible()
})

test.describe('i18n', () => {
  test('should display a localized preview of each posts from a specific author', async ({ authorsPage }) => {
    const author = 'Fantôme'
    const count = 1

    await authorsPage.goto(author.toLowerCase(), 'fr')

    await expect(authorsPage.content.getByText(`${count} article par ${author}`, { exact: true })).toBeVisible()

    const articles = authorsPage.content.getByRole('article')

    expect(await articles.count()).toBe(count)
  })
})
