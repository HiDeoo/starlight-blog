import type { RSSFeedItem } from '@astrojs/rss'
import { afterEach, expect, test, vi } from 'vitest'

import { getTestConfig, type MockBlogPost } from '../utils'

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

const blogPosts: MockBlogPost[] = [
  [
    'post-1.md',
    { title: 'Post', date: new Date('2024-02-01'), tags: ['Blog'], authors: [{ name: 'HiDeoo' }] },
    { prefix: 'blog' },
  ],
  [
    'story-1.md',
    { title: 'Story', date: new Date('2024-01-01'), tags: ['News'], authors: [{ name: 'Ghost' }] },
    { prefix: 'news' },
  ],
]

const t = ((key: string) => key) as App.Locals['t']

const newsConfig = getTestConfig('news')

test('generates RSS static paths for each blog', async () => {
  const { getRSSStaticPaths } = await getTestRSS()

  expect(getRSSStaticPaths()).toEqual([{ params: { prefix: 'blog' } }, { params: { prefix: 'news' } }])
})

test('generates RSS options for a specific blog', async () => {
  const { getRSSOptions } = await getTestRSS()

  const options = await getRSSOptions(newsConfig, new URL('https://example.com'), undefined, t)

  expect(options.title).toBe('Starlight Blog Test | News')
  expect(options.customData).toContain('<atom:link rel="self" href="https://example.com/news/rss.xml"/>')
  expect(options.items).toHaveLength(1)
  expect((options.items as RSSFeedItem[])[0]?.title).toBe('Story')
})

async function getTestRSS(posts: MockBlogPost[] = blogPosts) {
  vi.resetModules()

  const { mockBlogPosts } = await import('../utils')
  astroContentMock.content = await mockBlogPosts(posts)

  return import('../../../libs/rss')
}
