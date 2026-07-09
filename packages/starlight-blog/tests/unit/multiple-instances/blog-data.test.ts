import { expect, test, vi } from 'vitest'

import { getTestBlogData, getTestConfig } from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
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
  ])
})

const blogConfig = getTestConfig('blog')
const newsConfig = getTestConfig('news')

test('scopes posts to their prefix', async () => {
  const blogData = await getTestBlogData({ config: blogConfig })
  const newsData = await getTestBlogData({ config: newsConfig })

  expect(blogData.posts.map((post) => post.title)).toEqual(['Post'])
  expect(newsData.posts.map((post) => post.title)).toEqual(['Story'])
})

test('builds links with the matching blog prefix', async () => {
  const newsData = await getTestBlogData({ config: newsConfig })
  const post = newsData.posts[0]

  expect.assert(post)

  expect(post.href).toBe('/en/news/story-1/')
  expect(post.tags).toEqual([{ href: '/en/news/tags/news/', label: 'News' }])
})
