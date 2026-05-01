import { describe, expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import {
  getStructuredDataNode,
  getStructuredDataNodes,
  getStructuredDataScripts,
  getTestBlogData,
  getTestContext,
  mockCoverImage,
} from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')
  return mockBlogPosts([
    ['post-6.md', { title: 'Post 6', date: new Date('2024-06-01') }],
    ['post-5.md', { title: 'Post 5', date: new Date('2024-05-01') }],
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

describe('blog root', () => {
  test('adds structured data to the blog root page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog' })

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "hasPart": {
              "@id": "https://example.com/en/blog/#posts",
            },
            "inLanguage": "en",
            "mainEntity": {
              "@id": "https://example.com/en/blog/#blog",
            },
            "name": "Blog",
            "url": "https://example.com/en/blog/",
          },
          {
            "@id": "https://example.com/en/blog/#blog",
            "@type": "Blog",
            "name": "Blog",
            "url": "https://example.com/en/blog/",
          },
          {
            "@id": "https://example.com/en/blog/#posts",
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 6",
                  "url": "https://example.com/en/blog/post-6/",
                },
                "position": 1,
              },
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 5",
                  "url": "https://example.com/en/blog/post-5/",
                },
                "position": 2,
              },
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 4",
                  "url": "https://example.com/en/blog/post-4/",
                },
                "position": 3,
              },
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 3",
                  "url": "https://example.com/en/blog/post-3/",
                },
                "position": 4,
              },
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 2",
                  "url": "https://example.com/en/blog/post-2/",
                },
                "position": 5,
              },
            ],
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": 6,
          },
        ],
      }
    `)
  })
})

describe('blog pagination', () => {
  test('adds structured data to a paginated blog page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog/2' })

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "hasPart": {
              "@id": "https://example.com/en/blog/2/#posts",
            },
            "inLanguage": "en",
            "isPartOf": {
              "@id": "https://example.com/en/blog/#blog",
            },
            "name": "Blog",
            "url": "https://example.com/en/blog/2/",
          },
          {
            "@id": "https://example.com/en/blog/#blog",
            "@type": "Blog",
            "name": "Blog",
            "url": "https://example.com/en/blog/",
          },
          {
            "@id": "https://example.com/en/blog/2/#posts",
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "item": {
                  "@type": "BlogPosting",
                  "headline": "Post 1",
                  "url": "https://example.com/en/blog/post-1/",
                },
                "position": 1,
              },
            ],
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": 6,
          },
        ],
      }
    `)
  })
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
    const context = getTestContext(starlightBlog, starlightBlog.posts[5])

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
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
              "@id": "https://example.com/en/blog/#blog",
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
          },
          {
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
          },
        ],
      }
    `)
  })

  test('adds structured data with description', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[4])

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'description', 'Description of post 2')
  })

  test('adds structured data with excerpt', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[3])

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'description', 'Excerpt of post 3')
  })

  test('adds structured data with light cover image', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[4])

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'image', 'https://example.com/light.webp')
  })

  test('omits optional fields when they are not available', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0])

    await addStructuredData(context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    const blogPosting = getStructuredDataNode(nodes, 'BlogPosting')

    expect(blogPosting).not.toHaveProperty('author')
    expect(blogPosting).not.toHaveProperty('dateModified')
    expect(blogPosting).not.toHaveProperty('description')
    expect(blogPosting).not.toHaveProperty('image')
    expect(blogPosting).not.toHaveProperty('keywords')
  })
})

function expectBlogPostingContent(nodes: Record<string, unknown>[], key: string, value: unknown) {
  const blogPosting = getStructuredDataNode(nodes, 'BlogPosting')

  expect(blogPosting).toBeDefined()
  expect(blogPosting).toHaveProperty(key)
  expect(blogPosting?.[key]).toBe(value)
}
