import { describe, expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import { getStructuredDataScripts, getTestBlogData, getTestContext } from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([
    ['post-2.md', { title: 'Post 2', date: new Date('2024-02-01') }],
    [
      'post-1.md',
      {
        title: 'Post 1',
        date: new Date('2024-01-01'),
        tags: ['tag-1'],
        authors: [{ name: 'Ghost', url: 'https://example.com' }],
      },
    ],
  ])
})

describe('root', () => {
  test('uses localized blog title and URLs on the root page', async () => {
    const starlightBlog = await getTestBlogData({ locale: 'fr' })
    const context = getTestContext(starlightBlog, undefined, {
      id: 'blog',
      lang: 'fr',
      locale: 'fr',
    })

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
            "inLanguage": "fr",
            "mainEntity": {
              "@id": "https://example.com/fr/blog/#blog",
            },
            "name": "Blogue",
            "url": "https://example.com/fr/blog/",
          },
          {
            "@id": "https://example.com/fr/blog/#blog",
            "@type": "Blog",
            "name": "Blogue",
            "url": "https://example.com/fr/blog/",
          },
        ],
      }
    `)
  })
})

describe('blog post', () => {
  test('uses fallback content language for fallback pages', async () => {
    const starlightBlog = await getTestBlogData({ locale: 'fr' })
    const context = getTestContext(starlightBlog, starlightBlog.posts[1], {
      locale: 'fr',
      entryMetaLang: 'en',
      isFallback: true,
    })

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
                "@id": "https://example.com/fr/blog/authors/ghost/#author",
                "@type": "Person",
                "name": "Ghost",
                "url": "https://example.com",
              },
            ],
            "datePublished": "2024-01-01T00:00:00.000Z",
            "headline": "Post 1",
            "inLanguage": "en",
            "isPartOf": {
              "@id": "https://example.com/fr/blog/#blog",
              "@type": "Blog",
              "name": "Blogue",
              "url": "https://example.com/fr/blog/",
            },
            "keywords": [
              "tag-1",
            ],
            "mainEntityOfPage": "https://example.com/fr/blog/post-1/",
            "url": "https://example.com/fr/blog/post-1/",
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "item": "https://example.com/fr/blog/",
                "name": "Blogue",
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
})

describe('tags', () => {
  test('uses localized blog title and URLs on a tag page', async () => {
    const starlightBlog = await getTestBlogData({ locale: 'fr' })
    const context = getTestContext(starlightBlog, undefined, {
      id: 'blog/tags/tag-1',
      lang: 'fr',
      locale: 'fr',
    })

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
            "inLanguage": "fr",
            "isPartOf": {
              "@id": "https://example.com/fr/blog/#blog",
            },
            "mainEntity": {
              "@id": "https://example.com/fr/blog/tags/tag-1/#tag",
            },
            "name": "tag-1",
            "url": "https://example.com/fr/blog/tags/tag-1/",
          },
          {
            "@id": "https://example.com/fr/blog/#blog",
            "@type": "Blog",
            "name": "Blogue",
            "url": "https://example.com/fr/blog/",
          },
          {
            "@id": "https://example.com/fr/blog/tags/tag-1/#tag",
            "@type": "DefinedTerm",
            "name": "tag-1",
            "url": "https://example.com/fr/blog/tags/tag-1/",
          },
        ],
      }
    `)
  })
})

describe('authors', () => {
  test('uses localized blog title and URLs on an author page', async () => {
    const starlightBlog = await getTestBlogData({ locale: 'fr' })
    const context = getTestContext(starlightBlog, undefined, {
      id: 'blog/authors/ghost',
      lang: 'fr',
      locale: 'fr',
    })

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
            "inLanguage": "fr",
            "isPartOf": {
              "@id": "https://example.com/fr/blog/#blog",
            },
            "mainEntity": {
              "@id": "https://example.com/fr/blog/authors/ghost/#author",
            },
            "name": "Ghost",
            "url": "https://example.com/fr/blog/authors/ghost/",
          },
          {
            "@id": "https://example.com/fr/blog/#blog",
            "@type": "Blog",
            "name": "Blogue",
            "url": "https://example.com/fr/blog/",
          },
          {
            "@id": "https://example.com/fr/blog/authors/ghost/#author",
            "@type": "Person",
            "name": "Ghost",
            "url": "https://example.com",
          },
        ],
      }
    `)
  })
})
