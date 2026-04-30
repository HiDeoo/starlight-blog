import { describe, expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import { getTestBlogData, getTestContext, mockCoverImage } from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')
  return mockBlogPosts([
    ['post-4.md', { title: 'Post 4', date: new Date('2024-04-01') }],
    ['post-3.md', { title: 'Post 3', date: new Date('2024-03-01'), excerpt: 'Excerpt of **post 3**' }],
    [
      'post-2.md',
      {
        title: 'Post 2',
        date: new Date('2024-02-01'),
        description: 'Description of post 2',
        excerpt: 'Excerpt of **post 2**',
        cover: {
          alt: 'Cover image description',
          dark: mockCoverImage('dark.webp'),
          light: mockCoverImage('light.webp'),
        },
      },
    ],
    [
      'post-1.md',
      {
        title: 'Post 1',
        date: new Date('2024-01-01'),
        authors: [{ name: 'HiDeoo' }, { name: 'Ghost', title: 'A ghost', url: 'https://example.com' }],
        lastUpdated: new Date('2024-01-15'),
        tags: ['tag-1', 'tag-2'],
        cover: { alt: 'Cover image description', image: mockCoverImage() },
      },
    ],
  ])
})

describe('blog post', () => {
  test('does not add structured data when site is not defined', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0], { site: false })

    await addStructuredData(context)

    expect(context.locals.starlightRoute.head).toHaveLength(0)
  })

  test('does not add structured data on non-blog pages', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0], { id: 'getting-started' })

    await addStructuredData(context)

    expect(context.locals.starlightRoute.head).toHaveLength(0)
  })

  test('adds structured data to a blog post page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[3])

    await addStructuredData(context)

    const scripts = context.locals.starlightRoute.head.filter(
      (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
    )

    expect(scripts).toHaveLength(2)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "author": [
          {
            "@type": "Person",
            "name": "HiDeoo",
          },
          {
            "@type": "Person",
            "name": "Ghost",
            "url": "https://example.com",
          },
        ],
        "dateModified": "2024-01-15T00:00:00.000Z",
        "datePublished": "2024-01-01T00:00:00.000Z",
        "headline": "Post 1",
        "image": "https://example.com/test.webp",
        "inLanguage": "en",
        "isPartOf": {
          "@type": "Blog",
          "name": "Blog",
          "url": "https://example.com/en/blog/",
        },
        "keywords": [
          "tag-1",
          "tag-2",
        ],
        "mainEntityOfPage": "https://example.com/en/blog/post-1/",
        "url": "https://example.com/en/blog/post-1/",
      }
    `)

    expect.assert(scripts[1]?.content)
    expect(JSON.parse(scripts[1].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "https://example.com/en/blog/",
            "name": "Blog",
            "position": 1,
          },
          {
            "@type": "ListItem",
            "name": "Post 1",
            "position": 2,
          },
        ],
      }
    `)
  })

  test('adds structured data with description', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[2])

    await addStructuredData(context)

    const script = context.locals.starlightRoute.head.find(
      (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
    )

    expectScriptContent(script?.content, 'description', 'Description of post 2')
  })

  test('adds structured data with excerpt', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[1])

    await addStructuredData(context)

    const script = context.locals.starlightRoute.head.find(
      (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
    )

    expectScriptContent(script?.content, 'description', 'Excerpt of post 3')
  })

  test('adds structured data with light cover image', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[2])

    await addStructuredData(context)

    const script = context.locals.starlightRoute.head.find(
      (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
    )

    expectScriptContent(script?.content, 'image', 'https://example.com/light.webp')
  })

  test('omits optional fields when they are not available', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0])

    await addStructuredData(context)

    const script = context.locals.starlightRoute.head.find(
      (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
    )

    expect.assert(script?.content)
    const parsedContent = JSON.parse(script.content) as Record<string, unknown>

    expect(parsedContent).not.toHaveProperty('author')
    expect(parsedContent).not.toHaveProperty('dateModified')
    expect(parsedContent).not.toHaveProperty('description')
    expect(parsedContent).not.toHaveProperty('image')
    expect(parsedContent).not.toHaveProperty('keywords')
  })
})

function expectScriptContent(content: string | undefined, key: string, value: unknown) {
  expect.assert(content)
  const parsedContent = JSON.parse(content) as Record<string, unknown>
  expect(parsedContent).toHaveProperty(key)
  expect(parsedContent[key]).toBe(value)
}
