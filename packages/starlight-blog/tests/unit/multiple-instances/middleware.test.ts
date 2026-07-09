import type { APIContext } from 'astro'
import { expect, test, vi } from 'vitest'

import { onRequest } from '../../../middleware'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post.md', { title: 'Post', date: new Date('2024-01-01') }, { prefix: 'blog' }],
    ['story.md', { title: 'Story', date: new Date('2024-02-01') }, { prefix: 'news' }],
  ])
})

const next = () => Promise.resolve()

test('sets blog data for all instances', async () => {
  const context = getTestContext()

  await onRequest(context, next)

  expect([...context.locals.starlightBlogs.keys()]).toEqual(['blog', 'news'])

  expect(context.locals.starlightBlogs.get('blog')?.posts.map((post) => post.title)).toEqual(['Post'])
  expect(context.locals.starlightBlogs.get('news')?.posts.map((post) => post.title)).toEqual(['Story'])
})

test('throws when accessing `starlightBlog`', async () => {
  const context = getTestContext()

  await onRequest(context, next)

  expect(() => context.locals.starlightBlog).toThrowErrorMatchingInlineSnapshot(
    `[AstroUserError: \`locals.starlightBlog\` is not defined]`,
  )
})

test('adds mobile sidebar links for all instances on non-blog pages', async () => {
  const context = getTestContext()

  await onRequest(context, next)

  const mobileLinks = context.locals.starlightRoute.sidebar.filter(
    (entry) => entry.type === 'link' && entry.attrs['class'] === 'sl-blog-mobile-link',
  )

  expect(mobileLinks.map((link) => link.label)).toEqual(['Blog', 'News'])
  expect(mobileLinks.map((link) => (link.type === 'link' ? link.href : ''))).toEqual(['/blog/', '/news/'])
})

test('uses the expected config for blog page sidebars', async () => {
  const context = getTestContext('news')

  await onRequest(context, next)

  const firstSidebarEntry = context.locals.starlightRoute.sidebar[0]

  expect.assert(firstSidebarEntry?.type === 'link')
  expect(firstSidebarEntry.href).toBe('/news/')
})

function getTestContext(id = 'getting-started') {
  return {
    locals: {
      starlightRoute: { head: [], id, sidebar: [] },
      t: (key: string) => key,
    },
    site: new URL('https://example.com'),
  } as unknown as APIContext
}
