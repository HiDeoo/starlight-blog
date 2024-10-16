import { describe, expect, test, vi } from 'vitest'

import { getBlogEntry, getBlogStaticPaths } from '../../../libs/content'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-7.md', { title: 'Home Page', date: new Date('2024-02-24') }],
    ['post-6.md', { title: 'Home Page', date: new Date('2024-01-24') }],
    ['post-5.md', { title: 'Home Page', date: new Date('2023-12-24') }],
    ['post-4.md', { title: 'Home Page', date: new Date('2023-11-24') }],
    ['post-3.md', { title: 'Home Page', date: new Date('2023-10-24') }],
    ['post-2.md', { title: 'Home Page', date: new Date('2023-09-24') }],
    ['post-1.md', { title: 'Home Page', date: new Date('2023-08-24') }],
  ])
})

describe('getBlogStaticPaths', () => {
  test('respects the `prevNextLinksOrder` option in `chronological` order', async () => {
    const [firstPage, secondPage] = await getBlogStaticPaths()

    expect(firstPage?.props.prevLink).toBeDefined()
    expect(firstPage?.props.nextLink).toBeUndefined()

    expect(secondPage?.props.prevLink).toBeUndefined()
    expect(secondPage?.props.nextLink).toBeDefined()
  })
})

describe('getBlogEntry', () => {
  test('respects the `prevNextLinksOrder` option in `chronological` order', async () => {
    const post = await getBlogEntry('/blog/post-6', undefined)

    expect(post.prevLink?.href).toBe('/blog/post-5')
    expect(post.nextLink?.href).toBe('/blog/post-7')
  })
})
