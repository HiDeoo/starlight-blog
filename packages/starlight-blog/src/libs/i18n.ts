import context from 'virtual:starlight-blog/context'

export const DefaultLocale = context.defaultLocale.locale === 'root' ? undefined : context.defaultLocale.locale

export function getLocales(): Locale[] {
  if (!context.isMultilingual) return [DefaultLocale]
  return Object.keys(context.locales ?? {}).map((localeKey) => (localeKey === 'root' ? undefined : localeKey))
}

export function getLangFromLocale(locale: Locale): string {
  const localeConfig = locale ? context.locales?.[locale] : context.locales?.root
  const lang = localeConfig?.lang ?? locale
  const defaultLang = context.defaultLocale.lang ?? context.defaultLocale.locale
  return lang ?? defaultLang ?? 'en'
}

export type Locale = string | undefined
