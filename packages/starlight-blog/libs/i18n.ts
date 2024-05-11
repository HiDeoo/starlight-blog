import type { StarlightUserConfig } from '@astrojs/starlight/types'

export function getDefaultLocale(starlightConfig: StarlightUserConfig) {
  let defaultLocale = 'en'
  const defaultLocaleKey = starlightConfig.defaultLocale

  if (starlightConfig.locales) {
    defaultLocale =
      defaultLocaleKey && defaultLocaleKey !== 'root'
        ? starlightConfig.locales[defaultLocaleKey]?.lang ?? defaultLocaleKey
        : starlightConfig.locales['root']?.lang ?? defaultLocale
  }

  return defaultLocale
}
