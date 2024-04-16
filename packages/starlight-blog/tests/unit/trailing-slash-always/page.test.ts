import { describe, expect, test } from 'vitest'

import { getPathWithBase } from '../../../libs/page'

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
