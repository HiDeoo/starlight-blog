import { expect, test } from './test'

// TODO(HiDeoo) test post date

test('should fallback to the config author is none are provided in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-1')

  await expect(postPage.page.getByRole('link', { exact: true, name: 'HiDeoo' })).toBeVisible()
})

test('should use the referenced author in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-2')

  await expect(postPage.page.getByRole('link', { exact: true, name: 'HiDeoo' })).toBeVisible()
})

test('should use the author specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-3')

  await expect(postPage.page.getByRole('link', { exact: true, name: 'Ghost' })).toBeVisible()
})

test('should use the authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-4')

  await expect(postPage.page.getByRole('link', { exact: true, name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { exact: true, name: 'Astro' })).toBeVisible()
})

test('should use the referenced authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-5')

  await expect(postPage.page.getByRole('link', { exact: true, name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { exact: true, name: 'HiDeoo' })).toBeVisible()
})
