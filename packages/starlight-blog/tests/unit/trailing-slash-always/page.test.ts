import { describe, expect, test } from 'vitest'

import { getBlogPathWithBase, getPathWithBase } from '../../../libs/page'

describe('getBlogPathWithBase', () => {
  test('returns the blog root path', () => {
    expect(getBlogPathWithBase('/')).toBe('/blog/')
  })

  test('returns a blog post path', () => {
    expect(getBlogPathWithBase('/post-1')).toBe('/blog/post-1/')
  })

  test('returns the RSS feed path', () => {
    expect(getBlogPathWithBase('/rss.xml', true)).toBe('/blog/rss.xml')
  })
})

describe('getPathWithBase', () => {
  describe('trailingSlash', () => {
    test('does not strip trailing slashes', () => {
      expect(getPathWithBase('/blog/')).toBe('/blog/')
    })

    test('ensures trailing slashes', () => {
      expect(getPathWithBase('/blog')).toBe('/blog/')
    })
  })
})
