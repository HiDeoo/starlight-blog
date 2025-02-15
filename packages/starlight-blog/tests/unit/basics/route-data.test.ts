import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import { assert, describe, expect, test, vi } from 'vitest'

import { getRouteData } from '../../../middleware'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-4.md', { title: 'Post 4', date: new Date('2023-11-24') }],
    ['post-3.md', { title: 'Post 3', date: new Date('2023-10-24') }],
    ['post-2.md', { title: 'Post 2', date: new Date('2023-09-24') }],
    ['post-1.md', { title: 'Post 1', date: new Date('2023-08-24') }],
    [
      'post-7.md',
      { title: 'Post 7', date: new Date('2024-02-24'), authors: [{ name: 'HiDeoo' }], tags: ['tag-1', 'tag-2'] },
    ],
    ['post-6.md', { title: 'Post 6', date: new Date('2024-01-24') }],
    ['post-5.md', { title: 'Post 5', date: new Date('2023-12-24') }],
  ])
})

describe('posts', () => {
  test('includes all blog posts', async () => {
    const { posts } = await getTestRouteData()

    expect(posts).toHaveLength(7)
  })

  test('sorts blog posts by date', async () => {
    const { posts } = await getTestRouteData()

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
    const { posts } = await getTestRouteData()

    const post = posts[0]
    assert(post)

    expect(post.title).toBe('Post 7')

    expect(post.href).toBe('/en/blog/post-7')

    expect(post.createdAt).toBeInstanceOf(Date)
    expect(post.createdAt.toISOString()).toBe('2024-02-24T00:00:00.000Z')

    expect(post.featured).toBe(false)

    expect(post.authors).toEqual([{ name: 'HiDeoo' }])

    expect(post.tags).toEqual([
      { label: 'tag-1', href: '/en/blog/tags/tag-1' },
      { label: 'tag-2', href: '/en/blog/tags/tag-2' },
    ])
  })
})

function getTestRouteData() {
  return getRouteData({ locale: 'en' } as StarlightRouteData)
}
