import { describe, expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import { getStructuredDataScripts, getTestBlogData, getTestContext } from '../utils'

vi.mock('astro:content', async () => {
  const { mockBlogPosts } = await import('../utils')

  return mockBlogPosts([['post-1.md', { title: 'Post 1', date: new Date('2024-01-01') }]])
})

describe('blog post', () => {
  test('uses fallback content language for fallback pages', async () => {
    const starlightBlog = await getTestBlogData({ locale: 'fr' })
    const context = getTestContext(starlightBlog, starlightBlog.posts[0], {
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
            "datePublished": "2024-01-01T00:00:00.000Z",
            "headline": "Post 1",
            "inLanguage": "en",
            "isPartOf": {
              "@id": "https://example.com/fr/blog/#blog",
              "@type": "Blog",
              "name": "Blogue",
              "url": "https://example.com/fr/blog/",
            },
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
