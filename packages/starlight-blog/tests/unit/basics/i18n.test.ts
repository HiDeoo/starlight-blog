import type { StarlightUserConfig } from '@astrojs/starlight/types'
import { describe, expect, test } from 'vitest'

import { getDefaultLocale } from '../../../libs/i18n'

describe('getDefaultLocale', () => {
  test('returns the default locale for the built-in default locale', () => {
    expect(getTestDefaultLocale({})).toBe('en')
  })

  test('returns the default locale with a root locale', () => {
    expect(
      getTestDefaultLocale({
        locales: {
          root: { label: 'Français', lang: 'fr' },
        },
      }),
    ).toBe('fr')
  })

  test('returns the default locale with a root locale and a default locale', () => {
    expect(
      getTestDefaultLocale({
        defaultLocale: 'root',
        locales: {
          root: { label: 'Français', lang: 'fr' },
          'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        },
      }),
    ).toBe('fr')
  })

  test('returns the default locale with no root locale', () => {
    expect(
      getTestDefaultLocale({
        defaultLocale: 'fr',
        locales: {
          fr: { label: 'Français', lang: 'fr' },
          'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        },
      }),
    ).toBe('fr')
  })

  test('returns the default locale with non root single locale', () => {
    expect(
      getTestDefaultLocale({
        defaultLocale: 'fr',
        locales: {
          fr: { label: 'Français', lang: 'fr' },
        },
      }),
    ).toBe('fr')
  })
})

function getTestDefaultLocale(config: Partial<StarlightUserConfig>) {
  return getDefaultLocale(config as StarlightUserConfig)
}
