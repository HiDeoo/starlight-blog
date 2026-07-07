import type { RSSFeedItem, RSSOptions } from '@astrojs/rss'
import { afterEach, describe, expect, test, vi } from 'vitest'

import type { MockBlogPost } from '../utils'

const astroContentMock = vi.hoisted(() => ({
  content: undefined as Awaited<ReturnType<typeof import('../utils').mockBlogPosts>> | undefined,
}))

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: () => ({ addServerRenderer: () => undefined, renderToString: () => Promise.resolve('') }),
  },
}))

vi.mock('astro:content', async () => {
  const mod = await vi.importActual<typeof import('astro:content')>('astro:content')

  return {
    ...mod,
    getCollection: () => astroContentMock.content?.getCollection() ?? [],
  }
})

afterEach(() => {
  astroContentMock.content = undefined
  vi.useRealTimers()
})

const defaultBlogPosts: MockBlogPost[] = [
  ['post-21.md', { title: 'Post 21', date: new Date('2024-02-24'), description: 'Description of post 21' }],
  [
    'post-20.md',
    {
      title: 'Post 20',
      date: new Date('2024-01-24'),
      description: 'Description of post 20',
      excerpt: 'Excerpt of **post 20**',
    },
  ],
  ['post-19.md', { title: 'Post 19', date: new Date('2023-12-24') }],
  ['post-18.md', { title: 'Post 18', date: new Date('2023-11-24') }],
  ['post-17.md', { title: 'Post 17', date: new Date('2023-10-24') }],
  ['post-16.md', { title: 'Post 16', date: new Date('2023-09-24') }],
  ['post-15.md', { title: 'Post 15', date: new Date('2023-08-24') }],
  ['post-14.md', { title: 'Post 14', date: new Date('2023-07-24') }],
  ['post-13.md', { title: 'Post 13', date: new Date('2023-06-24') }],
  ['post-12.md', { title: 'Post 12', date: new Date('2023-05-24') }],
  ['post-11.md', { title: 'Post 11', date: new Date('2023-04-24') }],
  ['post-10.md', { title: 'Post 10', date: new Date('2023-03-24') }],
  ['post-9.md', { title: 'Post 9', date: new Date('2023-02-24') }],
  ['post-8.md', { title: 'Post 8', date: new Date('2023-01-24') }],
  ['post-7.md', { title: 'Post 7', date: new Date('2022-12-24') }],
  ['post-6.md', { title: 'Post 6', date: new Date('2022-11-24') }],
  ['post-5.md', { title: 'Post 5', date: new Date('2022-10-24') }],
  ['post-4.md', { title: 'Post 4', date: new Date('2022-09-24') }],
  ['post-3.md', { title: 'Post 3', date: new Date('2022-08-24') }],
  ['post-2.md', { title: 'Post 2', date: new Date('2022-07-24') }],
  ['post-1.md', { title: 'Post 1', date: new Date('2022-06-24') }],
]

const t = ((key: string) => key) as App.Locals['t']

describe('RSS feed', () => {
  test('includes only the last 20 blog posts', async () => {
    const { getRSSOptions } = await getTestRSS()

    const { items } = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(items).toHaveLength(20)
    expect(getItemAtIndex(items, 0)?.title).toBe('Post 21')
    expect(getItemAtIndex(items, 19)?.title).toBe('Post 2')
  })

  test('includes top-level metadata', async () => {
    const { getRSSOptions } = await getTestRSS()

    const url = new URL('http://example.com')

    const options = await getRSSOptions(url, undefined, t)

    expect(options.title).toBe('Starlight Blog Basics | Blog')
    expect(options.description).toMatchInlineSnapshot(`"Basic tests for the Starlight Blog plugin."`)
    expect(options.site).toBe(url)
    expect(options.xmlns).toEqual({
      atom: 'http://www.w3.org/2005/Atom',
      fh: 'http://purl.org/syndication/history/1.0',
    })
    expect(options.customData).toContain('<language>en</language>')
    expect(options.customData).toContain('<atom:link rel="self" href="http://example.com/blog/rss.xml"/>')
  })

  test('includes item descriptions', async () => {
    const { getRSSOptions } = await getTestRSS()

    const { items } = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(getItemAtIndex(items, 0)?.description).toBe('Description of post 21')
    expect(getItemAtIndex(items, 1)?.description).toBe('Excerpt of post 20')
  })

  test('links to the newest completed archive', async () => {
    const { getRSSOptions } = await getTestRSS()

    const options = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(options.customData).toContain(
      '<atom:link rel="prev-archive" href="http://example.com/blog/rss/2024-02.xml"/>',
    )
  })
})

describe('RSS complete feed', () => {
  const completeBlogPosts: MockBlogPost[] = [
    ['post-2.md', { title: 'Post 2', date: new Date('2024-02-24') }],
    ['post-1.md', { title: 'Post 1', date: new Date('2024-01-24') }],
  ]

  test('includes all blog posts', async () => {
    const { getRSSOptions } = await getTestRSS(completeBlogPosts)

    const { items } = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(items).toHaveLength(2)
    expect(getItemAtIndex(items, 0)?.title).toBe('Post 2')
    expect(getItemAtIndex(items, 1)?.title).toBe('Post 1')
  })

  test('marks the feed as complete', async () => {
    const { getRSSOptions } = await getTestRSS(completeBlogPosts)

    const options = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(options.customData).toContain('<fh:complete/>')
    expect(options.customData).not.toContain('prev-archive')
  })

  test('does not generate archive static paths', async () => {
    const { getRSSArchiveStaticPaths } = await getTestRSS(completeBlogPosts)

    await expect(getRSSArchiveStaticPaths()).resolves.toEqual([])
  })
})

describe('RSS archive static paths', () => {
  test('includes completed non-empty archive', async () => {
    const { getRSSArchiveStaticPaths } = await getTestRSS()

    const paths = await getRSSArchiveStaticPaths()
    const archives = paths.map((path) => path.params.archive)

    expect(archives).toContain('2024-02')
    expect(archives).toContain('2024-01')
    expect(archives).toContain('2023-12')
    expect(archives).toContain('2022-06')
  })

  test('skips empty archive', async () => {
    const { getRSSArchiveStaticPaths } = await getTestRSS()

    const paths = await getRSSArchiveStaticPaths()
    const archives = paths.map((path) => path.params.archive)

    expect(archives).not.toContain('2024-03')
    expect(archives).not.toContain('2022-05')
  })
})

describe('RSS archive feed', () => {
  test('includes archive metadata', async () => {
    const { getRSSArchiveOptions } = await getTestRSS()

    const url = new URL('http://example.com')

    const options = await getRSSArchiveOptions(url, undefined, '2024-01', t)

    expect(options.title).toBe('Starlight Blog Basics | Blog')
    expect(options.description).toMatchInlineSnapshot(`"Basic tests for the Starlight Blog plugin."`)
    expect(options.site).toBe(url)
    expect(options.xmlns).toEqual({
      atom: 'http://www.w3.org/2005/Atom',
      fh: 'http://purl.org/syndication/history/1.0',
    })
    expect(options.customData).toContain('<language>en</language>')
    expect(options.customData).toContain('<fh:archive/>')
    expect(options.customData).toContain('<atom:link rel="current" href="http://example.com/blog/rss.xml"/>')
    expect(options.customData).toContain('<atom:link rel="self" href="http://example.com/blog/rss/2024-01.xml"/>')
  })

  test('includes only entries from the archive period', async () => {
    const { getRSSArchiveOptions } = await getTestRSS()

    const { items } = await getRSSArchiveOptions(new URL('http://example.com'), undefined, '2024-01', t)

    expect(items).toHaveLength(1)
    expect(getItemAtIndex(items, 0)?.title).toBe('Post 20')
  })

  test('links to older and newer archives', async () => {
    const { getRSSArchiveOptions } = await getTestRSS()

    const options = await getRSSArchiveOptions(new URL('http://example.com'), undefined, '2024-01', t)

    expect(options.customData).toContain(
      '<atom:link rel="prev-archive" href="http://example.com/blog/rss/2023-12.xml"/>',
    )
    expect(options.customData).toContain(
      '<atom:link rel="next-archive" href="http://example.com/blog/rss/2024-02.xml"/>',
    )
  })

  test('does not link the newest archive to a newer archive', async () => {
    const { getRSSArchiveOptions } = await getTestRSS()

    const options = await getRSSArchiveOptions(new URL('http://example.com'), undefined, '2024-02', t)

    expect(options.customData).toContain(
      '<atom:link rel="prev-archive" href="http://example.com/blog/rss/2024-01.xml"/>',
    )
    expect(options.customData).not.toContain('rel="next-archive"')
  })

  test('does not link the oldest archive to an older archive', async () => {
    const { getRSSArchiveOptions } = await getTestRSS()

    const options = await getRSSArchiveOptions(new URL('http://example.com'), undefined, '2022-06', t)

    expect(options.customData).not.toContain('rel="prev-archive"')
    expect(options.customData).toContain(
      '<atom:link rel="next-archive" href="http://example.com/blog/rss/2022-07.xml"/>',
    )
  })
})

describe('RSS current archive period', () => {
  // Use a date within the mocked current archive period so the posts from that period are not part of an archive.
  const date = new Date('2024-02-28T00:00:00.000Z')

  test('includes all posts from the current archive period', async () => {
    const { getRSSOptions } = await getTestRSS(getCurrentPeriodBlogPosts(), date)

    const { items } = await getRSSOptions(new URL('http://example.com'), undefined, t)

    // All 21 posts from the current archive period should be included, even though the RSS feed limit is 20.
    expect(items).toHaveLength(21)
    expect(getItemAtIndex(items, 0)?.title).toBe('Post 22')
    expect(getItemAtIndex(items, 20)?.title).toBe('Post 2')
  })

  test('does not generate an archive for the current archive period', async () => {
    const { getRSSArchiveStaticPaths } = await getTestRSS(getCurrentPeriodBlogPosts(), date)

    const paths = await getRSSArchiveStaticPaths()
    const archives = paths.map((path) => path.params.archive)

    expect(archives).not.toContain('2024-02')
    expect(archives).toContain('2024-01')
  })

  test('links to the newest completed archive before the current archive period', async () => {
    const { getRSSOptions } = await getTestRSS(getCurrentPeriodBlogPosts(), date)

    const options = await getRSSOptions(new URL('http://example.com'), undefined, t)

    expect(options.customData).toContain(
      '<atom:link rel="prev-archive" href="http://example.com/blog/rss/2024-01.xml"/>',
    )
  })
})

function getItemAtIndex(items: RSSOptions['items'], index: number) {
  return (items as RSSFeedItem[])[index]
}

// Use a date after all mocked blog posts so no post is part of the current archive period.
async function getTestRSS(posts: MockBlogPost[] = defaultBlogPosts, now = new Date('2025-01-01T00:00:00.000Z')) {
  vi.useRealTimers()
  vi.resetModules()

  const { mockBlogPosts } = await import('../utils')
  astroContentMock.content = await mockBlogPosts(posts)

  const rss = await import('../../../libs/rss')

  vi.useFakeTimers()
  vi.setSystemTime(now)

  return rss
}

function getCurrentPeriodBlogPosts(): MockBlogPost[] {
  const posts: MockBlogPost[] = []

  // 21 posts from the current archive period
  for (let day = 22; day >= 2; day--) {
    posts.push([
      `post-${day}.md`,
      {
        title: `Post ${day}`,
        date: new Date(`2024-02-${`${day}`.padStart(2, '0')}`),
      },
    ])
  }

  // 1 post from the previous archive period
  posts.push(['post-1.md', { title: 'Post 1', date: new Date('2024-01-24') }])

  return posts
}
