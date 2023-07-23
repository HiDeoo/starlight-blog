import { expect, test } from './test'

test('should display a preview of each posts with proper tag', async ({ tagsPage }) => {
  const tag = 'Starlight'
  const count = 3

  await tagsPage.goto(tag.toLowerCase())

  await expect(tagsPage.page.getByText(`${count} posts with the tag “${tag}”`, { exact: true })).toBeVisible()

  const articles = tagsPage.page.getByRole('article')

  expect(await articles.count()).toBe(count)

  for (const article of await articles.all()) {
    expect(await article.getByRole('listitem').filter({ hasText: tag }).count()).toBe(1)
  }
})
