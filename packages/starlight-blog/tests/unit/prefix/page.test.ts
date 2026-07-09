import { describe, expect, test } from 'vitest'

import { getRelativeBlogUrl } from '../../../libs/page'
import { getTestConfig } from '../utils'

describe('getRelativeBlogUrl', () => {
  const config = getTestConfig()

  test('returns the blog root path', () => {
    expect(getRelativeBlogUrl(config, '/', undefined)).toBe('/news/')
    expect(getRelativeBlogUrl(config, '/', 'fr')).toBe('/fr/news/')
  })

  test('returns a blog post path', () => {
    expect(getRelativeBlogUrl(config, '/post-1', undefined)).toBe('/news/post-1/')
    expect(getRelativeBlogUrl(config, '/post-1', 'fr')).toBe('/fr/news/post-1/')
  })

  test('returns the RSS feed path', () => {
    expect(getRelativeBlogUrl(config, '/rss.xml', undefined, true)).toBe('/news/rss.xml')
    expect(getRelativeBlogUrl(config, '/rss.xml', 'fr', true)).toBe('/fr/news/rss.xml')
  })
})
