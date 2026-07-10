import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getLocaleFromRelativeUrl } from '../../../libs/page'

describe('getLocaleFromRelativeUrl', () => {
  test('returns the locale from a relative URL', () => {
    expect(getLocaleFromRelativeUrl('/blog/post/')).toBeUndefined()
    expect(getLocaleFromRelativeUrl('/fr/blog/post/')).toBe('fr')
  })

  describe('with a base', () => {
    beforeEach(() => {
      vi.stubEnv('BASE_URL', '/base/')
      vi.resetModules()
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    test('ignores the base when returning the locale', async () => {
      const { getLocaleFromRelativeUrl } = await import('../../../libs/page')

      expect(getLocaleFromRelativeUrl('/base/blog/post/')).toBeUndefined()
      expect(getLocaleFromRelativeUrl('/base/fr/blog/post/')).toBe('fr')
    })
  })
})
