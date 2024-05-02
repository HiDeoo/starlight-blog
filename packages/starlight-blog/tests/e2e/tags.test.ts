import { expect, test } from './test'

test('should display a preview of each posts with proper tag', async ({ tagsPage }) => {
  const tag = 'Starlight'
  const count = 4

  await tagsPage.goto(tag.toLowerCase())

  await expect(tagsPage.page.getByText(`${count} posts with the tag “${tag}”`, { exact: true })).toBeVisible()

  const articles = tagsPage.page.getByRole('article')

  expect(await articles.count()).toBe(count)

  for (const article of await articles.all()) {
    expect(await article.getByRole('listitem').filter({ hasText: tag }).count()).toBe(1)
  }
})

test('should not include draft blog posts', async ({ tagsPage }) => {
  const tag = 'Placeholder'
  const count = 2

  await tagsPage.goto(tag.toLowerCase())

  await expect(tagsPage.page.getByText(`${count} posts with the tag “${tag}”`, { exact: true })).toBeVisible()

  const articles = tagsPage.page.getByRole('article')

  expect(await articles.count()).toBe(count)
})

test('should not display a link to edit this page', async ({ tagsPage }) => {
  await tagsPage.goto('starlight')

  await expect(tagsPage.page.getByText('Edit page')).not.toBeVisible()
})

test('should not generate pages for tags with only draft blog posts', async ({ tagsPage }) => {
  const response = await tagsPage.goto('wip')

  expect(response?.ok()).toBe(false)
})
