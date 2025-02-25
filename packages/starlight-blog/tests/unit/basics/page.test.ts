import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

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
  describe('with no base', () => {
    test('returns the path with no base', () => {
      expect(getRelativeUrl('/blog')).toBe('/blog/')
    })

    test('prefixes the path with a leading slash if needed', () => {
      expect(getRelativeUrl('blog')).toBe('/blog/')
    })
  })

  describe('with a base', () => {
    beforeEach(() => {
      vi.stubEnv('BASE_URL', '/base/')
      vi.resetModules()
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    test('returns the path prefixed with the base', async () => {
      const { getRelativeUrl } = await import('../../../libs/page')
      expect(getRelativeUrl('/blog')).toBe('/base/blog/')
    })
  })

  describe('trailingSlash', () => {
    test('does not strip trailing slashes', () => {
      expect(getRelativeUrl('/blog/')).toBe('/blog/')
    })

    test('ensures trailing slashes', () => {
      expect(getRelativeUrl('/blog')).toBe('/blog/')
    })
  })
})
