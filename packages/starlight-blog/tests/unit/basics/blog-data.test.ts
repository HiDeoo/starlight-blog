import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import { assert, describe, expect, test, vi } from 'vitest'

import { getBlogData } from '../../../middleware'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-4.md', { title: 'Post 4', date: new Date('2023-11-24') }],
    ['post-3.md', { title: 'Post 3', date: new Date('2023-10-24') }],
    ['post-2.md', { title: 'Post 2', date: new Date('2023-09-24') }],
    ['post-1.md', { title: 'Post 1', date: new Date('2023-08-24') }],
    [
      'post-7.md',
      {
        title: 'Post 7',
        date: new Date('2024-02-24'),
        authors: [{ name: 'HiDeoo' }],
        tags: ['tag-1', 'tag-2'],
        cover: { alt: 'Cover image description', image: mockCoverImage() },
      },
    ],
    ['post-6.md', { title: 'Post 6', date: new Date('2024-01-24'), metrics: { readingTime: 590, words: 1990 } }],
    [
      'post-5.md',
      {
        title: 'Post 5',
        date: new Date('2023-12-24'),
        authors: [{ name: 'HiDeoo' }, { name: 'Ghost', title: 'A ghost', url: 'https://example.com' }],
      },
    ],
  ])
})

describe('posts', () => {
  test('includes all blog posts', async () => {
    const { posts } = await getTestBlogData()

    expect(posts).toHaveLength(7)
  })

  test('sorts blog posts by date', async () => {
    const { posts } = await getTestBlogData()

    expect(posts.map((post) => post.title)).toEqual([
      'Post 7',
      'Post 6',
      'Post 5',
      'Post 4',
      'Post 3',
      'Post 2',
      'Post 1',
    ])
  })

  test('includes post data in the expected format', async () => {
    vi.doMock('../../../libs/metrics', async () => {
      const mod = await vi.importActual<typeof import('../../../libs/metrics')>('../../../libs/metrics')

      return {
        ...mod,
        getMetrics: vi.fn().mockReturnValue({
          readingTime: { minutes: 5, seconds: 290 },
          words: { rounded: 1100, total: 1065 },
        }),
      }
    })

    vi.resetModules()
    const middleware = await import('../../../middleware')

    const { posts } = await getTestBlogData(middleware.getBlogData)

    const post = posts[0]
    assert(post)

    expect(post.title).toBe('Post 7')

    expect(post.href).toBe('/en/blog/post-7/')

    expect(post.createdAt).toBeInstanceOf(Date)
    expect(post.createdAt.toISOString()).toBe('2024-02-24T00:00:00.000Z')

    expect(post.featured).toBe(false)

    expect(post.authors).toEqual([{ name: 'HiDeoo' }])

    expect(post.tags).toEqual([
      { label: 'tag-1', href: '/en/blog/tags/tag-1/' },
      { label: 'tag-2', href: '/en/blog/tags/tag-2/' },
    ])

    expect(post.cover).toEqual({
      alt: 'Cover image description',
      image: mockCoverImage(),
    })

    expect(post.entry.data.title).toBe('Post 7')

    expect(post.metrics.readingTime.minutes).toBe(5)
    expect(post.metrics.readingTime.seconds).toBe(290)
    expect(post.metrics.words.rounded).toBe(1100)
    expect(post.metrics.words.total).toBe(1065)

    vi.doUnmock('../../../libs/metrics')
  })

  test('uses user-provided metrics in post data', async () => {
    const { posts } = await getTestBlogData()

    const post = posts[1]
    assert(post)

    expect(post.metrics.readingTime.minutes).toBe(10)
    expect(post.metrics.readingTime.seconds).toBe(590)
    expect(post.metrics.words.rounded).toBe(2000)
    expect(post.metrics.words.total).toBe(1990)
  })
})

describe('authors', () => {
  test('includes all blog post authors', async () => {
    const { authors } = await getTestBlogData()

    expect(authors).toHaveLength(2)
  })

  test('includes author data in the expected format', async () => {
    const { authors } = await getTestBlogData()

    const author = authors[1]
    assert(author)

    expect(author.name).toBe('Ghost')
    expect(author.title).toBe('A ghost')
    expect(author.url).toBe('https://example.com')
  })
})

function getTestBlogData(getter?: typeof getBlogData) {
  return (getter ?? getBlogData)({ locale: 'en' } as StarlightRouteData, (() => '') as App.Locals['t'])
}

function mockCoverImage() {
  return {
    format: 'webp' as const,
    height: 100,
    src: '',
    width: 100,
  }
}
