import { describe, expect, test } from 'vitest'

import { getPathWithBase } from '../../../libs/page'

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
