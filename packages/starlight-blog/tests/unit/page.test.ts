import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPathWithBase } from '../../libs/page'

describe('getPathWithBase', () => {
  describe('with no base', () => {
    test('returns the path without prefixing it with the base', () => {
      expect(getPathWithBase('/blog')).toBe('/blog')
    })

    test('prefixes the path with a leading slash if needed', () => {
      expect(getPathWithBase('blog')).toBe('/blog')
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

    test('returns the path without prefixing it with the base', async () => {
      const { getPathWithBase } = await import('../../libs/page')
      expect(getPathWithBase('/blog')).toBe('/base/blog')
    })
  })
})
