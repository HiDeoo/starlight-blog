import { expect, test } from './test'

test('should add a blog link to all pages with the configured title', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.getByRole('link', { exact: true, name: 'Blog' })).toBeVisible()
})

test('should use the configured title for the page', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.title()).resolves.toMatch('Blog')
})

test('should not display the content panel containing the title', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.getByRole('heading', { level: 1 })).not.toBeVisible()
})

test('should create the blog post list pages', async ({ blogPage }) => {
  let response = await blogPage.goto()

  expect(response?.ok()).toBe(true)

  response = await blogPage.goto(1)

  expect(response?.ok()).toBe(false)

  response = await blogPage.goto(2)

  expect(response?.ok()).toBe(true)

  response = await blogPage.goto(3)

  expect(response?.ok()).toBe(true)

  response = await blogPage.goto(4)

  expect(response?.ok()).toBe(false)

  response = await blogPage.goto(5)

  expect(response?.ok()).toBe(false)
})

test('should display navigation links', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.prevLink).not.toBeVisible()
  await expect(blogPage.nextLink).toBeVisible()

  await blogPage.goto(2)

  await expect(blogPage.prevLink).toBeVisible()
  await expect(blogPage.nextLink).toBeVisible()

  await blogPage.goto(3)

  await expect(blogPage.prevLink).toBeVisible()
  await expect(blogPage.nextLink).not.toBeVisible()
})

test('should add a link to all posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const link = blogPage.page.getByRole('link', { name: 'All posts' })

  await expect(link).toBeVisible()
  expect(await link.getAttribute('href')).toBe('/blog')
})

test('should add links to recent posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Recent posts'
  const group = blogPage.page.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByRole('heading', { exact: true, level: 2, name: groupName })).toBeVisible()

  expect(await group.getByRole('link').count()).toBe(10)

  // TODO(HiDeoo) Test the order somewhere else without relying on titles
  await expect(group.getByRole('link')).toHaveText([
    'Example Blog Post 13',
    'Example Blog Post 12',
    'Example Blog Post 11',
    'Example Blog Post 10',
    'Example Blog Post 9',
    'Example Blog Post 8',
    'Example Blog Post 7',
    'Example Blog Post 6',
    'Example Blog Post 5',
    'Example Blog Post 4',
  ])
})

test('should add links to tags in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Tags'
  const group = blogPage.page.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByRole('heading', { exact: true, level: 2, name: groupName })).toBeVisible()

  expect(await group.getByRole('link').count()).toBe(6)

  await expect(group.getByRole('link').nth(0)).toContainText('Starlight')
  await expect(group.getByRole('link').nth(1)).toContainText('Example')
  await expect(group.getByRole('link').nth(2)).toContainText('Amazing Content')
  await expect(group.getByRole('link').nth(3)).toContainText('Ipsum')
  await expect(group.getByRole('link').nth(4)).toContainText('Lorem')
  await expect(group.getByRole('link').nth(5)).toContainText('Test')
})
