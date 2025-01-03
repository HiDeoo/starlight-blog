import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'

import { getLangFromLocale, type Locale } from './i18n'

export function getBlogTitle(locale: Locale): string {
  if (typeof config.title === 'string') return config.title

  let title: string
  const lang = getLangFromLocale(locale)

  if (config.title[lang]) {
    title = config.title[lang]
  } else {
    const defaultLang = starlightConfig.defaultLocale.lang ?? starlightConfig.defaultLocale.locale
    title = defaultLang ? (config.title[defaultLang] ?? '') : ''
  }

  if (title.length === 0) {
    throw new Error('The blog title must have a key for the default language.')
  }

  return title
}