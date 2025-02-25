import { describe, expect, test, vi } from 'vitest'

import { getBlogEntry, getBlogStaticPaths } from '../../../libs/content'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-7.md', { title: 'Post 7', date: new Date('2024-02-24') }],
    ['post-6.md', { title: 'Post 6', date: new Date('2024-01-24') }],
    ['post-5.md', { title: 'Post 5', date: new Date('2023-12-24') }],
    ['post-4.md', { title: 'Post 4', date: new Date('2023-11-24') }],
    ['post-3.md', { title: 'Post 3', date: new Date('2023-10-24') }],
    ['post-2.md', { title: 'Post 2', date: new Date('2023-09-24') }],
    ['post-1.md', { title: 'Post 1', date: new Date('2023-08-24') }],
  ])
})

describe('getBlogStaticPaths', () => {
  test('respects the `prevNextLinksOrder` option in `reverse-chronological` order', async () => {
    const [firstPage, secondPage] = await getBlogStaticPaths()

    expect(firstPage?.props.prevLink).toBeUndefined()
    expect(firstPage?.props.nextLink).toBeDefined()

    expect(secondPage?.props.prevLink).toBeDefined()
    expect(secondPage?.props.nextLink).toBeUndefined()
  })
})

describe('getBlogEntry', () => {
  test('respects the `prevNextLinksOrder` option in `reverse-chronological` order', async () => {
    const post = await getBlogEntry('/blog/post-6/', undefined)

    expect(post.prevLink?.href).toBe('/blog/post-7/')
    expect(post.nextLink?.href).toBe('/blog/post-5/')
  })
})
