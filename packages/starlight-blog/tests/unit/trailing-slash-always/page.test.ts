import { describe, expect, test } from 'vitest'

import { getRelativeBlogUrl, getRelativeUrl } from '../../../libs/page'
import { getTestConfig } from '../utils'

describe('getRelativeBlogUrl', () => {
  const config = getTestConfig()

  test('returns the blog root path', () => {
    expect(getRelativeBlogUrl(config, '/', undefined)).toBe('/blog/')
    expect(getRelativeBlogUrl(config, '/', 'fr')).toBe('/fr/blog/')
  })

  test('returns a blog post path', () => {
    expect(getRelativeBlogUrl(config, '/post-1', undefined)).toBe('/blog/post-1/')
    expect(getRelativeBlogUrl(config, '/post-1', 'fr')).toBe('/fr/blog/post-1/')
  })

  test('returns the RSS feed path', () => {
    expect(getRelativeBlogUrl(config, '/rss.xml', undefined, true)).toBe('/blog/rss.xml')
    expect(getRelativeBlogUrl(config, '/rss.xml', 'fr', true)).toBe('/fr/blog/rss.xml')
  })
})

describe('getRelativeUrl', () => {
  describe('trailingSlash', () => {
    test('does not strip trailing slashes', () => {
      expect(getRelativeUrl('/blog/')).toBe('/blog/')
    })

    test('ensures trailing slashes', () => {
      expect(getRelativeUrl('/blog')).toBe('/blog/')
    })
  })
})
