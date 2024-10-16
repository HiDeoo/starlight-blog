import type { RSSFeedItem } from '@astrojs/rss'
import { describe, expect, test, vi } from 'vitest'

import { getRSSOptions } from '../../../libs/rss'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-21.md', { title: 'Post 21', date: new Date('2024-02-24') }],
    ['post-20.md', { title: 'Post 20', date: new Date('2024-01-24') }],
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
  ])
})

describe('getRSSOptions', () => {
  test('includes only the last 20 blog posts', async () => {
    const { items } = await getRSSOptions(new URL('http://example.com'), undefined)

    expect(items).toHaveLength(20)
    expect(getItemAtIndex(items, 0)?.title).toBe('Post 21')
    expect(getItemAtIndex(items, 19)?.title).toBe('Post 2')
  })

  test('includes top-level metadata', async () => {
    const url = new URL('http://example.com')

    const options = await getRSSOptions(url, undefined)

    expect(options.title).toBe('Starlight Blog Basics | Blog')
    expect(options.description).toMatchInlineSnapshot(`"Basic tests for the Starlight Blog plugin."`)
    expect(options.site).toBe(url)
    expect(options.customData).toMatchInlineSnapshot(`"<language>en</language>"`)
  })
})

function getItemAtIndex(items: Awaited<ReturnType<typeof getRSSOptions>>['items'], index: number) {
  return (items as RSSFeedItem[])[index]
}
