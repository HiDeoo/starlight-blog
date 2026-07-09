import { describe, expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import {
  getStructuredDataNode,
  getStructuredDataNodes,
  getStructuredDataScripts,
  getTestBlogData,
  getTestConfig,
  getTestContext,
} from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts, mockCoverImage } = await import('../utils')

  return mockBlogPosts([
    ['post-6.md', { title: 'Post 6', date: new Date('2024-06-01') }],
    ['post-5.md', { title: 'Post 5', date: new Date('2024-05-01'), tags: ['tag-1'] }],
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

const config = getTestConfig()

describe('root', () => {
  test('adds structured data to the blog root page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog' })

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
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
        ],
      }
    `)
  })
})

describe('pagination', () => {
  test('adds structured data to a paginated blog page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog/2' })

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
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
        ],
      }
    `)
  })
})

describe('post', () => {
  test('does not add structured data when site is not defined', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0], { site: false })

    addStructuredData(config, context)

    expect(context.locals.starlightRoute.head).toHaveLength(0)
  })

  test('does not add structured data on non-blog pages', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0], { id: 'getting-started' })

    addStructuredData(config, context)

    expect(context.locals.starlightRoute.head).toHaveLength(0)
  })

  test('adds structured data to a blog post page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[5])

    addStructuredData(config, context)

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
                "@id": "https://example.com/en/blog/authors/hideoo/#author",
                "@type": "Person",
                "name": "HiDeoo",
              },
              {
                "@id": "https://example.com/en/blog/authors/ghost/#author",
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

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'description', 'Description of post 2')
  })

  test('adds structured data with excerpt', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[3])

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'description', 'Excerpt of post 3')
  })

  test('adds structured data with light cover image', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[4])

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    expectBlogPostingContent(nodes, 'image', 'https://example.com/light.webp')
  })

  test('omits optional fields when they are not available', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, starlightBlog.posts[0])

    addStructuredData(config, context)

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

describe('tags', () => {
  test('adds structured data to a tag page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog/tags/tag-1' })

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "inLanguage": "en",
            "isPartOf": {
              "@id": "https://example.com/en/blog/#blog",
            },
            "mainEntity": {
              "@id": "https://example.com/en/blog/tags/tag-1/#tag",
            },
            "name": "tag-1",
            "url": "https://example.com/en/blog/tags/tag-1/",
          },
          {
            "@id": "https://example.com/en/blog/#blog",
            "@type": "Blog",
            "name": "Blog",
            "url": "https://example.com/en/blog/",
          },
          {
            "@id": "https://example.com/en/blog/tags/tag-1/#tag",
            "@type": "DefinedTerm",
            "name": "tag-1",
            "url": "https://example.com/en/blog/tags/tag-1/",
          },
        ],
      }
    `)
  })
})

describe('authors', () => {
  test('adds structured data to an author page', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog/authors/ghost' })

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)

    expect(scripts).toHaveLength(1)

    expect.assert(scripts[0]?.content)
    expect(JSON.parse(scripts[0].content)).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "inLanguage": "en",
            "isPartOf": {
              "@id": "https://example.com/en/blog/#blog",
            },
            "mainEntity": {
              "@id": "https://example.com/en/blog/authors/ghost/#author",
            },
            "name": "Ghost",
            "url": "https://example.com/en/blog/authors/ghost/",
          },
          {
            "@id": "https://example.com/en/blog/#blog",
            "@type": "Blog",
            "name": "Blog",
            "url": "https://example.com/en/blog/",
          },
          {
            "@id": "https://example.com/en/blog/authors/ghost/#author",
            "@type": "Person",
            "name": "Ghost",
            "url": "https://example.com",
          },
        ],
      }
    `)
  })

  test('omits the author url when it is not defined', async () => {
    const starlightBlog = await getTestBlogData()
    const context = getTestContext(starlightBlog, undefined, { id: 'blog/authors/hideoo' })

    addStructuredData(config, context)

    const scripts = getStructuredDataScripts(context)
    const nodes = getStructuredDataNodes(scripts)

    const author = getStructuredDataNode(nodes, 'Person')

    expect(author).toBeDefined()
    expect(author).toHaveProperty('name', 'HiDeoo')
    expect(author).not.toHaveProperty('url')
  })
})

function expectBlogPostingContent(nodes: Record<string, unknown>[], key: string, value: unknown) {
  const blogPosting = getStructuredDataNode(nodes, 'BlogPosting')

  expect(blogPosting).toBeDefined()
  expect(blogPosting).toHaveProperty(key)
  expect(blogPosting?.[key]).toBe(value)
}
