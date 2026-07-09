import type { RSSFeedItem, RSSOptions } from '@astrojs/rss'
import type { GetStaticPathsResult } from 'astro'
import configs from 'virtual:starlight-blog/configs'
import context from 'virtual:starlight-blog/context'

import type { StarlightBlogConfig } from './config'
import { renderBlogEntryToString } from './container'
import { getBlogEntries, type StarlightBlogEntry } from './content'
import { transformHTMLForRSS } from './html'
import { getLangFromLocale, getLocales, type Locale } from './i18n'
import { stripMarkdown } from './markdown'
import { getPathWithLocale, getRelativeBlogUrl, getRelativeUrl } from './page'
import { getBlogTitle } from './title'

const rssItemLimit = 20

export function getRSSStaticPaths() {
  const paths = []

  for (const config of configs.values()) {
    if (!config.rss) continue

    for (const locale of getLocales()) {
      paths.push(getRSSStaticPath(config, locale))
    }
  }

  return paths satisfies GetStaticPathsResult
}

export async function getRSSArchiveStaticPaths() {
  const paths = []

  for (const config of configs.values()) {
    if (!config.rss) continue

    for (const locale of getLocales()) {
      const entries = await getBlogEntries(config, locale)
      if (entries.length <= rssItemLimit) continue

      for (const archive of getRSSArchives(entries)) {
        paths.push(getRSSArchiveStaticPath(config, locale, archive))
      }
    }
  }

  return paths satisfies GetStaticPathsResult
}

export async function getRSSOptions(
  config: StarlightBlogConfig,
  site: URL | undefined,
  locale: Locale,
  t: App.Locals['t'],
) {
  const entries = await getBlogEntries(config, locale)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The route is only injected if `site` is defined in the user Astro config.
  const feedSite = site!

  const archives = getRSSArchives(entries)
  const rssEntries = archives.length === 0 ? entries : getRSSEntries(entries)
  const isComplete = rssEntries.length === entries.length
  const links = getRSSLinks(config, feedSite, locale, archives, isComplete)

  return getRSSOptionsForEntries(
    config,
    rssEntries,
    feedSite,
    locale,
    t,
    getRSSCustomData(locale, links, { complete: isComplete }),
  )
}

export async function getRSSArchiveOptions(
  config: StarlightBlogConfig,
  site: URL | undefined,
  locale: Locale,
  archive: string | undefined,
  t: App.Locals['t'],
) {
  if (!archive) throw new Error("Missing RSS 'archive' parameter to generate archive RSS feed.")

  const entries = await getBlogEntries(config, locale)
  const archives = getRSSArchives(entries)

  if (!archives.includes(archive)) throw new Error(`Unknown RSS archive '${archive}'.`)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The route is only injected if `site` is defined in the user Astro config.
  const feedSite = site!

  const archiveEntries = entries.filter((entry) => getRSSArchiveKey(entry.data.date) === archive)
  const links = getArchiveRSSLinks(config, feedSite, locale, archives, archive)

  return getRSSOptionsForEntries(
    config,
    archiveEntries,
    feedSite,
    locale,
    t,
    getRSSCustomData(locale, links, { archive: true }),
  )
}

function getRSSStaticPath(config: StarlightBlogConfig, locale: Locale) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
    },
  }
}

function getRSSArchives(entries: StarlightBlogEntry[]) {
  const currentArchive = getCurrentRSSArchiveKey()
  const archives = new Set<string>()

  for (const entry of entries) {
    const archive = getRSSArchiveKey(entry.data.date)

    if (archive < currentArchive) {
      archives.add(archive)
    }
  }

  return [...archives].toSorted().toReversed()
}

function getRSSArchiveKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}

function getCurrentRSSArchiveKey() {
  return getRSSArchiveKey(new Date())
}

function getRSSArchiveStaticPath(config: StarlightBlogConfig, locale: Locale, archive: string) {
  return {
    params: {
      archive,
      prefix: getPathWithLocale(config.prefix, locale),
    },
  }
}

function getRSSEntries(entries: StarlightBlogEntry[]) {
  const currentArchive = getCurrentRSSArchiveKey()
  const rssEntries = new Set(entries.slice(0, rssItemLimit))

  for (const entry of entries) {
    if (getRSSArchiveKey(entry.data.date) >= currentArchive) {
      rssEntries.add(entry)
    }
  }

  return [...rssEntries]
}

async function getRSSOptionsForEntries(
  config: StarlightBlogConfig,
  entries: StarlightBlogEntry[],
  site: URL,
  locale: Locale,
  t: App.Locals['t'],
  customData: string,
) {
  const options: RSSOptions = {
    title: getRSSTitle(config, locale),
    description: context.description ?? '',
    site: site,
    // https://datatracker.ietf.org/doc/html/rfc5005#appendix-B
    xmlns: { atom: 'http://www.w3.org/2005/Atom', fh: 'http://purl.org/syndication/history/1.0' },
    items: await Promise.all(entries.map((entry) => getRSSItem(entry, site, locale, t))),
    customData,
  }

  if (context.trailingSlash !== 'ignore') {
    options.trailingSlash = context.trailingSlash === 'always'
  }

  return options
}

async function getRSSItem(
  entry: StarlightBlogEntry,
  feedSite: URL,
  locale: Locale,
  t: App.Locals['t'],
): Promise<RSSFeedItem> {
  const link = getRelativeUrl(`/${getPathWithLocale(entry.id, locale)}`)

  return {
    title: entry.data.title,
    link,
    pubDate: entry.data.date,
    categories: entry.data.tags,
    description: getRSSDescription(entry),
    content: await getRSSContent(entry, feedSite, t),
  }
}

function getRSSTitle(config: StarlightBlogConfig, locale: Locale): string {
  let title: string

  if (typeof context.title === 'string') {
    title = context.title
  } else {
    const lang = getLangFromLocale(locale)
    if (context.title[lang]) {
      title = context.title[lang]
    } else {
      const defaultLang = context.defaultLocale.lang ?? context.defaultLocale.locale
      title = defaultLang ? (context.title[defaultLang] ?? '') : ''
    }
  }

  if (title.length > 0) {
    title += ` ${context.titleDelimiter ?? '|'} `
  }

  title += getBlogTitle(config, locale)

  return title
}

function getRSSDescription(entry: StarlightBlogEntry): string | undefined {
  if (!entry.data.excerpt) return entry.data.description

  return stripMarkdown(entry.data.excerpt)
}

async function getRSSContent(entry: StarlightBlogEntry, baseURL: URL, t: App.Locals['t']): Promise<string> {
  const html = await renderBlogEntryToString(entry, t)
  return transformHTMLForRSS(html, baseURL)
}

function getRSSCustomData(locale: Locale, links: RSSLink[], options: { archive?: boolean; complete?: boolean } = {}) {
  const customData = [`<language>${getLangFromLocale(locale)}</language>`]

  if (options.archive) customData.push('<fh:archive/>')
  if (options.complete) customData.push('<fh:complete/>')

  customData.push(...links.map((link) => `<atom:link rel="${link.rel}" href="${link.href}"/>`))

  return customData.join('\n')
}

function getRSSLinks(
  config: StarlightBlogConfig,
  site: URL,
  locale: Locale,
  archives: string[],
  isComplete: boolean,
): RSSLink[] {
  const links: RSSLink[] = [{ rel: 'self', href: getRSSURL(config, site, locale) }]

  if (!isComplete) {
    const previousArchive = archives[0]

    if (previousArchive) {
      links.push({ rel: 'prev-archive', href: getRSSArchiveURL(config, site, locale, previousArchive) })
    }
  }

  return links
}

function getArchiveRSSLinks(
  config: StarlightBlogConfig,
  site: URL,
  locale: Locale,
  archives: string[],
  archive: string,
): RSSLink[] {
  const archiveIndex = archives.indexOf(archive)
  const previousArchive = archives[archiveIndex + 1]
  const nextArchive = archiveIndex > 0 ? archives[archiveIndex - 1] : undefined

  const links: RSSLink[] = [
    { rel: 'current', href: getRSSURL(config, site, locale) },
    { rel: 'self', href: getRSSArchiveURL(config, site, locale, archive) },
  ]

  if (previousArchive) {
    links.push({ rel: 'prev-archive', href: getRSSArchiveURL(config, site, locale, previousArchive) })
  }

  if (nextArchive) {
    links.push({ rel: 'next-archive', href: getRSSArchiveURL(config, site, locale, nextArchive) })
  }

  return links
}

function getRSSURL(config: StarlightBlogConfig, site: URL, locale: Locale) {
  return new URL(getRelativeBlogUrl(config, '/rss.xml', locale, true), site).href
}

function getRSSArchiveURL(config: StarlightBlogConfig, site: URL, locale: Locale, archive: string) {
  return new URL(getRelativeBlogUrl(config, `/rss/${archive}.xml`, locale, true), site).href
}

interface RSSLink {
  href: string
  rel: string
}
