import { describe, expect, test } from 'vitest'

import { getBlogPathWithBase, getPathWithBase } from '../../../libs/page'

describe('getBlogPathWithBase', () => {
  test('returns the blog root path', () => {
    expect(getBlogPathWithBase('/')).toBe('/blog')
  })

  test('returns a blog post path', () => {
    expect(getBlogPathWithBase('/post-1/')).toBe('/blog/post-1')
  })
})

describe('getPathWithBase', () => {
  describe('trailingSlash', () => {
    test('strips trailing slashes', () => {
      expect(getPathWithBase('/blog/')).toBe('/blog')
    })

    test('does not ensure trailing slashes', () => {
      expect(getPathWithBase('/blog')).toBe('/blog')
    })
  })
})
