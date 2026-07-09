import { expect, test, vi } from 'vitest'

import { addStructuredData } from '../../../libs/structured-data'
import { getStructuredDataScripts, getTestBlogData, getTestConfig, getTestContext } from '../utils'

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

const newsConfig = getTestConfig('news')

test('uses a specific blog config for root structured data', async () => {
  const newsData = await getTestBlogData({ config: newsConfig })
  const context = getTestContext(newsData, undefined, { config: newsConfig, id: 'news' })

  addStructuredData(newsConfig, context)

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
            "@id": "https://example.com/en/news/#blog",
          },
          "name": "News",
          "url": "https://example.com/en/news/",
        },
        {
          "@id": "https://example.com/en/news/#blog",
          "@type": "Blog",
          "name": "News",
          "url": "https://example.com/en/news/",
        },
      ],
    }
  `)
})
