import { describe, expect, test } from 'vitest'

import { getRelativeBlogUrl } from '../../../libs/page'

describe('getRelativeBlogUrl', () => {
  test('returns the blog root path', () => {
    expect(getRelativeBlogUrl('/', undefined)).toBe('/news/')
    expect(getRelativeBlogUrl('/', 'fr')).toBe('/fr/news/')
  })

  test('returns a blog post path', () => {
    expect(getRelativeBlogUrl('/post-1', undefined)).toBe('/news/post-1/')
    expect(getRelativeBlogUrl('/post-1', 'fr')).toBe('/fr/news/post-1/')
  })

  test('returns the RSS feed path', () => {
    expect(getRelativeBlogUrl('/rss.xml', undefined, true)).toBe('/news/rss.xml')
    expect(getRelativeBlogUrl('/rss.xml', 'fr', true)).toBe('/fr/news/rss.xml')
  })
})
