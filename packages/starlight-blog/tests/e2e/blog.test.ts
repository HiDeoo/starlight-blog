import { expect, test } from './test'

test('should add a blog link to the header of all pages with the configured title', async ({ blogPage }) => {
  await blogPage.goto()

  const link = blogPage.page.getByRole('link', { exact: true, name: 'Demo Blog' })

  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', '/blog/')
})

test('should use the configured title for the page', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.title()).resolves.toMatch('Blog')
})

test('should not display the content panel containing the title', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.content.getByRole('heading', { level: 1 })).not.toBeVisible()
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

  const link = blogPage.sidebar.getByRole('link', { name: 'All posts' })

  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', '/blog/')
})

test('should add links to recent posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Recent posts'
  const group = blogPage.sidebar.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  const links = group.getByRole('link')

  expect(await links.count()).toBe(10)

  const allLinks = await links.all()
  const allHrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))

  expect(allHrefs.every((href) => href?.startsWith('/blog/'))).toBe(true)
})

test('should not add recent draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const group = blogPage.sidebar.getByRole('group').filter({ hasText: 'Recent posts' })

  await expect(group.getByRole('link', { exact: true, name: 'Succedere velut consumptis ferat' })).not.toBeVisible()
})

test('should add links to featured posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Featured posts'
  const group = blogPage.sidebar.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  expect(await group.getByRole('link').count()).toBe(1)
})

test('should not add links to featured posts in the sidebar recent posts group', async ({ blogPage }) => {
  await blogPage.goto()

  const group = blogPage.sidebar.getByRole('group').filter({ hasText: 'Recent posts' })

  expect(await group.textContent()).not.toContain('Vario nunc polo')
})

test('should add links to tags in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Tags'
  const group = blogPage.sidebar.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  const links = group.getByRole('link')

  expect(await links.count()).toBe(8)

  const allLinks = await links.all()
  const allHrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))

  expect(allHrefs.every((href) => href?.startsWith('/blog/tags/'))).toBe(true)

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
    blogPage.sidebar.getByRole('group').filter({ hasText: 'Tags' }).getByRole('link', { exact: true, name: 'WIP (1)' }),
  ).not.toBeVisible()
})

test('should not count tags from draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.sidebar
      .getByRole('group')
      .filter({ hasText: 'Tags' })
      .getByRole('link', { exact: true, name: 'Placeholder (2)' }),
  ).toBeVisible()
})

test('should add links to authors in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  const groupName = 'Authors'
  const group = blogPage.sidebar.getByRole('group').filter({ hasText: groupName })

  await expect(group.getByText(groupName, { exact: true })).toBeVisible()

  const links = group.getByRole('link')

  expect(await links.count()).toBe(3)

  const allLinks = await links.all()
  const allHrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))

  expect(allHrefs.every((href) => href?.startsWith('/blog/authors/'))).toBe(true)

  await expect(links.nth(0)).toContainText('HiDeoo')
  await expect(links.nth(1)).toContainText('Ghost')
  await expect(links.nth(2)).toContainText('Astro')
})

test('should not add links to authors from draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.sidebar
      .getByRole('group')
      .filter({ hasText: 'Authors' })
      .getByRole('link', { exact: true, name: 'Unknown (1)' }),
  ).not.toBeVisible()
})

test('should not count authors from draft blog posts in the sidebar', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(
    blogPage.sidebar
      .getByRole('group')
      .filter({ hasText: 'Authors' })
      .getByRole('link', { exact: true, name: 'HiDeoo (10)' }),
  ).toBeVisible()
})

test('should display a preview of each posts', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')

  expect(await articles.count()).toBe(5)

  const titles = articles.getByRole('heading', { level: 2 })

  expect(await titles.count()).toBe(5)

  const links = titles.getByRole('link')

  expect(await titles.getByRole('link').count()).toBe(5)

  const allLinks = await links.all()
  const allHrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))

  expect(allHrefs.every((href) => href?.startsWith('/blog/'))).toBe(true)

  await expect(articles.first().getByText('Donec eget vestibulum leo.')).toBeVisible()
})

test('should use sorted posts', async ({ blogPage }) => {
  await blogPage.goto()

  const times = await blogPage.page.getByRole('article').locator(':not(.update-date) > time').all()
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
  await expect(link).toHaveAttribute('href', '/blog/rss.xml')
})

test('should not include Starlight pagination links', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.locator('.pagination-links a[rel="prev"]')).not.toBeVisible()
  await expect(blogPage.page.locator('.pagination-links a[rel="next"]')).not.toBeVisible()
})

test.describe('i18n', () => {
  test('should use a localized link for the header blog link', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    await expect(blogPage.page.getByRole('link', { exact: true, name: 'Blog Démo' })).toHaveAttribute(
      'href',
      '/fr/blog/',
    )
  })

  test('should create the blog post list localized pages', async ({ blogPage }) => {
    let response = await blogPage.goto(undefined, 'fr')

    expect(response?.ok()).toBe(true)

    response = await blogPage.goto(1, 'fr')

    expect(response?.ok()).toBe(false)

    response = await blogPage.goto(2, 'fr')

    expect(response?.ok()).toBe(true)

    response = await blogPage.goto(3, 'fr')

    expect(response?.ok()).toBe(true)

    response = await blogPage.goto(4, 'fr')

    expect(response?.ok()).toBe(false)

    response = await blogPage.goto(5, 'fr')

    expect(response?.ok()).toBe(false)
  })

  test('should add a localized link to all posts in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    await expect(blogPage.sidebar.getByRole('link', { name: 'Tous les articles' })).toHaveAttribute('href', '/fr/blog/')
  })

  test('should add localized links to recent posts in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    const group = blogPage.sidebar.getByRole('group').filter({ hasText: 'Recent posts' })
    const links = await group.getByRole('link').all()
    const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')))

    expect(hrefs.every((href) => href?.startsWith('/fr/blog/'))).toBe(true)
  })

  test('should use localized title for recent posts in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    await expect(
      blogPage.sidebar
        .getByRole('group')
        .filter({ hasText: 'Articles récents' })
        .getByRole('link', { name: 'Achivi amans (fr)' }),
    ).toBeVisible()
  })

  test('should add localized links to tags in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    const group = blogPage.sidebar.getByRole('group').filter({ hasText: 'Tags' })
    const links = await group.getByRole('link').all()
    const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')))

    expect(hrefs.every((href) => href?.startsWith('/fr/blog/tags/'))).toBe(true)
  })

  test('should use localized tags in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    await expect(
      blogPage.sidebar.getByRole('group').filter({ hasText: 'Étiquettes' }).getByRole('link', { name: 'Ébauche (1)' }),
    ).toBeVisible()
  })

  test('should add localized links to authors in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    const group = blogPage.sidebar.getByRole('group').filter({ hasText: 'Authors' })
    const links = await group.getByRole('link').all()
    const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')))

    expect(hrefs.every((href) => href?.startsWith('/fr/blog/authors/'))).toBe(true)
  })

  test('should display a preview of each localized posts', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    const articles = blogPage.page.getByRole('article')
    const titles = articles.getByRole('heading', { level: 2 })

    const frPostLink = titles.getByRole('link', { name: 'Achivi amans (fr)' })

    await expect(frPostLink).toBeVisible()
    await expect(frPostLink).toHaveAttribute('href', '/fr/blog/achivi-amans/')

    await expect(articles.getByText('12 déc. 2020')).toBeVisible()
    await expect(articles.getByText('30 déc. 2021')).toBeVisible()

    expect(await articles.nth(4).locator('.sl-markdown-content').textContent()).toMatch(/aliquam. \(fr\)/)

    const frTag = articles.getByRole('link', { name: 'Ébauche' })
    await expect(frTag).toBeVisible()
    await expect(frTag).toHaveAttribute('href', '/fr/blog/tags/ébauche/')

    const links = await titles.getByRole('link').all()
    const hrefs = await Promise.all(links.map((link) => link.getAttribute('href')))

    expect(hrefs.every((href) => href?.startsWith('/fr/blog/'))).toBe(true)
  })

  test('should add a localized link to the RSS feed in the sidebar', async ({ blogPage }) => {
    await blogPage.goto(undefined, 'fr')

    await expect(blogPage.page.getByLabel('Principal').getByRole('link', { name: 'RSS' })).toHaveAttribute(
      'href',
      '/fr/blog/rss.xml',
    )
  })
})
