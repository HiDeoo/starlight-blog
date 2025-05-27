import type { RSSOptions } from '@astrojs/rss'
import type { GetStaticPathsResult } from 'astro'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'
import context from 'virtual:starlight-blog-context'

import { renderBlogEntryToString } from './container'
import { getBlogEntries, type StarlightBlogEntry } from './content'
import { transformHTMLForRSS } from './html'
import { DefaultLocale, getLangFromLocale, type Locale } from './i18n'
import { stripMarkdown } from './markdown'
import { getPathWithLocale, getRelativeUrl } from './page'
import { getBlogTitle } from './title'

export function getRSSStaticPaths() {
  const paths = []

  if (starlightConfig.isMultilingual) {
    for (const localeKey of Object.keys(starlightConfig.locales)) {
      const locale = localeKey === 'root' ? undefined : localeKey
      paths.push(getRSSStaticPath(locale))
    }
  } else {
    paths.push(getRSSStaticPath(DefaultLocale))
  }

  return paths satisfies GetStaticPathsResult
}

export async function getRSSOptions(site: URL | undefined, locale: Locale, t: App.Locals['t']) {
  let entries = await getBlogEntries(locale)
  entries = entries.slice(0, 20)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The route is only injected if `site` is defined in the user Astro config.
  const feedSite = site!

  const options: RSSOptions = {
    title: getRSSTitle(locale),
    description: context.description ?? '',
    site: feedSite,
    items: await Promise.all(
      entries.map(async (entry) => {
        const link = getRelativeUrl(`/${getPathWithLocale(entry.id, locale)}`)

        return {
          title: entry.data.title,
          link,
          pubDate: entry.data.date,
          categories: entry.data.tags,
          description: await getRSSDescription(entry),
          content: await getRSSContent(entry, feedSite, t),
        }
      }),
    ),
    customData: `<language>${getLangFromLocale(locale)}</language>`,
  }

  if (context.trailingSlash !== 'ignore') {
    options.trailingSlash = context.trailingSlash === 'always'
  }

  return options
}

function getRSSStaticPath(locale: Locale) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
    },
  }
}

function getRSSTitle(locale: Locale): string {
  let title: string

  if (typeof context.title === 'string') {
    title = context.title
  } else {
    const lang = getLangFromLocale(locale)
    if (starlightConfig.title[lang]) {
      title = starlightConfig.title[lang]
    } else {
      const defaultLang = starlightConfig.defaultLocale.lang ?? starlightConfig.defaultLocale.locale
      title = defaultLang ? (starlightConfig.title[defaultLang] ?? '') : ''
    }
  }

  if (title.length > 0) {
    title += ` ${context.titleDelimiter ?? '|'} `
  }

  title += getBlogTitle(locale)

  return title
}

function getRSSDescription(entry: StarlightBlogEntry): Promise<string> | undefined {
  if (!entry.data.excerpt) return

  return stripMarkdown(entry.data.excerpt)
}

async function getRSSContent(entry: StarlightBlogEntry, baseURL: URL, t: App.Locals['t']): Promise<string> {
  const html = await renderBlogEntryToString(entry, t)
  return transformHTMLForRSS(html, baseURL)
}
