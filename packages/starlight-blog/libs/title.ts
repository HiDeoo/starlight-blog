import context from 'virtual:starlight-blog/context'

import type { StarlightBlogConfig } from './config'
import { getLangFromLocale, type Locale } from './i18n'

export function getBlogTitle(config: StarlightBlogConfig, locale: Locale): string {
  if (typeof config.title === 'string') return config.title

  let title: string
  const lang = getLangFromLocale(locale)

  if (config.title[lang]) {
    title = config.title[lang]
  } else {
    const defaultLang = context.defaultLocale.lang ?? context.defaultLocale.locale
    title = defaultLang ? (config.title[defaultLang] ?? '') : ''
  }

  if (title.length === 0) {
    throw new Error('The blog title must have a key for the default language.')
  }

  return title
}
