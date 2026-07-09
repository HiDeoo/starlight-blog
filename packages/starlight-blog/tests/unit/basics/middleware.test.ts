import type { APIContext } from 'astro'
import { expect, test, vi } from 'vitest'

import { onRequest } from '../../../middleware'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([['post.md', { title: 'Post', date: new Date('2024-01-01') }]])
})

const context = {
  locals: { starlightRoute: { id: 'getting-started', sidebar: [] } },
  site: new URL('https://example.com'),
} as unknown as APIContext

const next = () => Promise.resolve()

test('sets blog data', async () => {
  await onRequest(context, next)

  expect([...context.locals.starlightBlogs.keys()]).toEqual(['blog'])

  expect(context.locals.starlightBlogs.get('blog')?.posts.map((post) => post.title)).toEqual(['Post'])
})

test('does not throw when accessing `starlightBlog`', async () => {
  await onRequest(context, next)

  expect(context.locals.starlightBlog.posts.map((post) => post.title)).toEqual(['Post'])
})
