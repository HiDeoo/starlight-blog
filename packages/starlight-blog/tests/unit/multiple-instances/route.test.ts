import { expect, test, vi } from 'vitest'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    [
      'post.md',
      { title: 'Post', date: new Date('2024-01-01'), tags: ['Test', 'Tech'], authors: [{ name: 'HiDeoo' }] },
      { prefix: 'blog' },
    ],
    [
      'story.md',
      { title: 'Story', date: new Date('2024-02-01'), tags: ['Test', 'Art'], authors: [{ name: 'HiDeoo' }] },
      { prefix: 'news' },
    ],
  ])
})

test('generates blog list routes for each instances', async () => {
  const { getBlogStaticPaths } = await import('../../../libs/content')

  const paths = await getBlogStaticPaths()

  expect(paths).toEqual(
    expect.arrayContaining([
      objectContaining({
        params: objectContaining({ prefix: 'blog' }),
        props: objectContaining({ prefix: 'blog' }),
      }),
      objectContaining({
        params: objectContaining({ prefix: 'news' }),
        props: objectContaining({ prefix: 'news' }),
      }),
    ]),
  )
})

test('generates author routes for each instances', async () => {
  const { getAuthorsStaticPaths } = await import('../../../libs/authors')

  const paths = await getAuthorsStaticPaths()

  expect(paths).toEqual(
    expect.arrayContaining([
      objectContaining({
        params: { prefix: 'blog', author: 'hideoo' },
        props: objectContaining({ prefix: 'blog' }),
      }),
      objectContaining({
        params: { prefix: 'news', author: 'hideoo' },
        props: objectContaining({ prefix: 'news' }),
      }),
    ]),
  )
})

test('generates tag routes for each instances', async () => {
  const { getTagsStaticPaths } = await import('../../../libs/tags')

  const paths = await getTagsStaticPaths()

  expect(paths).toEqual(
    expect.arrayContaining([
      objectContaining({
        params: { prefix: 'blog', tag: 'test' },
        props: objectContaining({ prefix: 'blog' }),
      }),
      objectContaining({
        params: { prefix: 'blog', tag: 'tech' },
        props: objectContaining({ prefix: 'blog' }),
      }),
      objectContaining({
        params: { prefix: 'news', tag: 'test' },
        props: objectContaining({ prefix: 'news' }),
      }),
      objectContaining({
        params: { prefix: 'news', tag: 'art' },
        props: objectContaining({ prefix: 'news' }),
      }),
    ]),
  )
})

function objectContaining(value: unknown): unknown {
  return expect.objectContaining(value) as unknown
}
