import { describe, expect, test } from 'vitest'

import { getRelativeBlogUrl, getRelativeUrl, isAnyBlogPostPage } from '../../../libs/page'

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

describe('isAnyBlogPostPage', () => {
  describe('excludes feed and index files', () => {
    test('excludes rss.xml without trailing slash', () => {
      expect(isAnyBlogPostPage('blog/rss.xml')).toBe(false)
    })

    test('excludes rss.xml with trailing slash', () => {
      expect(isAnyBlogPostPage('blog/rss.xml/')).toBe(false)
    })

    test('excludes rss.xml with i18n prefix', () => {
      expect(isAnyBlogPostPage('en/blog/rss.xml')).toBe(false)
      expect(isAnyBlogPostPage('en/blog/rss.xml/')).toBe(false)
    })

    test('excludes sitemap files', () => {
      expect(isAnyBlogPostPage('blog/sitemap-index.xml')).toBe(false)
      expect(isAnyBlogPostPage('blog/sitemap-0.xml')).toBe(false)
    })
  })

  describe('includes blog post pages', () => {
    test('includes regular blog post', () => {
      expect(isAnyBlogPostPage('blog/2025-01-01-sample-post')).toBe(true)
    })

    test('includes blog post with trailing slash', () => {
      expect(isAnyBlogPostPage('blog/2025-01-01-sample-post/')).toBe(true)
    })

    test('excludes numeric pagination pages', () => {
      expect(isAnyBlogPostPage('blog/2')).toBe(false)
      expect(isAnyBlogPostPage('blog/2/')).toBe(false)
    })

    test('excludes tag pages', () => {
      expect(isAnyBlogPostPage('blog/tags/astro')).toBe(false)
    })

    test('excludes author pages', () => {
      expect(isAnyBlogPostPage('blog/authors/john')).toBe(false)
    })
  })
})
