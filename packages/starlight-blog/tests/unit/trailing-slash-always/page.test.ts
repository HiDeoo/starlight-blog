import { describe, expect, test } from 'vitest'

import { getRelativeBlogUrl, getRelativeUrl } from '../../../libs/page'

describe('getRelativeBlogUrl', () => {
  test('returns the blog root path', () => {
    expect(getRelativeBlogUrl('/', undefined)).toBe('/blog/')
    expect(getRelativeBlogUrl('/', 'fr')).toBe('/fr/blog/')
  })

  test('returns a blog post path', () => {
    expect(getRelativeBlogUrl('/post-1', undefined)).toBe('/blog/post-1/')
    expect(getRelativeBlogUrl('/post-1', 'fr')).toBe('/fr/blog/post-1/')
  })

  test('returns the RSS feed path', () => {
    expect(getRelativeBlogUrl('/rss.xml', undefined, true)).toBe('/blog/rss.xml')
    expect(getRelativeBlogUrl('/rss.xml', 'fr', true)).toBe('/fr/blog/rss.xml')
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
