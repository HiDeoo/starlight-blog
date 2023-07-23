import { expect, test } from './test'

// TODO(HiDeoo) test post date

test('should fallback to the config author is none are provided in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-1')

  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the referenced author in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-2')

  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the author specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-3')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
})

test('should use the authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-4')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { name: 'Astro' })).toBeVisible()
})

test('should use the referenced authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('post-5')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should not display tags in a post not having tags', async ({ postPage }) => {
  await postPage.goto('post-2')

  await expect(postPage.page.getByText('Tags: ', { exact: true })).not.toBeVisible()
})

test('should display tags in a post having tags', async ({ postPage }) => {
  await postPage.goto('post-6')

  await expect(postPage.page.getByText('Tags: ', { exact: true })).toBeVisible()

  const starlightTag = postPage.page.getByRole('link', { exact: true, name: 'Starlight' })
  const amazingContentTag = postPage.page.getByRole('link', { exact: true, name: 'Amazing Content' })

  await expect(starlightTag).toBeVisible()
  expect(await starlightTag.getAttribute('href')).toBe('/blog/tags/starlight')

  await expect(amazingContentTag).toBeVisible()
  expect(await amazingContentTag.getAttribute('href')).toBe('/blog/tags/amazing-content')
})

test('should display navigation links', async ({ postPage }) => {
  await postPage.goto('post-1')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/post-2')
  await expect(postPage.nextLink).not.toBeVisible()

  await postPage.goto('post-2')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/post-3')
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/post-1')

  await postPage.goto('post-12')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/post-13')
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/post-11')

  await postPage.goto('post-13')

  await expect(postPage.prevLink).not.toBeVisible()
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/post-12')
})
