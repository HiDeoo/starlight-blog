import starlightConfig from 'virtual:starlight/user-config'

export const DefaultLocale =
  starlightConfig.defaultLocale.locale === 'root' ? undefined : starlightConfig.defaultLocale.locale

export function getLangFromLocale(locale: Locale): string {
  const lang = locale ? starlightConfig.locales?.[locale]?.lang : starlightConfig.locales?.root?.lang
  const defaultLang = starlightConfig.defaultLocale.lang ?? starlightConfig.defaultLocale.locale
  return lang ?? defaultLang ?? 'en'
}

export type Locale = string | undefined
