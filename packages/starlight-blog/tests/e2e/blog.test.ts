import { expect, test } from './test'

test('should add a blog link to all pages with the configured title', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.getByRole('link', { exact: true, name: 'Demo Blog' })).toBeVisible()
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

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  expect(await group.getByRole('link').count()).toBe(10)
})

test('should not add recent draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const group = blogPage.page.getByRole('group').filter({ hasText: 'Recent posts' })

  await expect(group.getByRole('link', { exact: true, name: 'Succedere velut consumptis ferat' })).not.toBeVisible()
})

test('should add links to tags in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Tags'
  const group = blogPage.page.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  const links = group.getByRole('link')

  expect(await links.count()).toBe(8)

  await expect(links.nth(0)).toContainText('Starlight')
  await expect(links.nth(1)).toContainText('Example')
  await expect(links.nth(2)).toContainText('Placeholder')
  await expect(links.nth(3)).toContainText('Amazing Content')
  await expect(links.nth(4)).toContainText('Demo')
  await expect(links.nth(5)).toContainText('Ipsum')
  await expect(links.nth(6)).toContainText('Lorem')
  await expect(links.nth(7)).toContainText('Test')
})

test('should not add links to tags from draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.page.getByRole('group').filter({ hasText: 'Tags' }).getByRole('link', { exact: true, name: 'WIP (1)' }),
  ).not.toBeVisible()
})

test('should not count tags from draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.page
      .getByRole('group')
      .filter({ hasText: 'Tags' })
      .getByRole('link', { exact: true, name: 'Placeholder (2)' }),
  ).toBeVisible()
})

test('should display a preview of each posts', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')

  expect(await articles.count()).toBe(5)

  const titles = articles.getByRole('heading', { level: 2 })

  expect(await titles.count()).toBe(5)
  expect(await titles.getByRole('link').count()).toBe(5)

  await expect(articles.first().getByText('Donec eget vestibulum leo.')).toBeVisible()
})

test('should use sorted posts', async ({ blogPage }) => {
  await blogPage.goto()

  const times = await blogPage.page.getByRole('article').locator('time').all()
  const datetimes = await Promise.all(times.map((time) => time.getAttribute('datetime')))

  const dates = datetimes.map((datetime) => {
    if (!datetime) {
      throw new Error('Missing datetime attribute.')
    }

    return new Date(datetime)
  })

  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())

  expect(dates).toEqual(sortedDates)
})

test('should not display a link to edit this page', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.getByText('Edit page')).not.toBeVisible()
})

test('should render markdown content in custom excerpt', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')

  await expect(articles.first().locator('strong').getByText('vestibulum')).toBeVisible()
})

test('should not list draft blog posts in production', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.page.getByRole('article').getByRole('link', { exact: true, name: 'Succedere velut consumptis ferat' }),
  ).not.toBeVisible()

  await blogPage.goto(2)

  await expect(
    blogPage.page.getByRole('article').getByRole('link', { exact: true, name: 'Pertimuit munere' }),
  ).not.toBeVisible()
})

test('should add a link to the RSS feed in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const link = blogPage.page.getByLabel('Main').getByRole('link', { name: 'RSS' })

  await expect(link).toBeVisible()
  expect(await link.getAttribute('href')).toBe('/blog/rss.xml')
})
