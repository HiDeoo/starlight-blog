import type { GetStaticPathsResult } from 'astro'
import { type CollectionEntry, getCollection, getEntry, render } from 'astro:content'
import configs from 'virtual:starlight-blog/configs'
import context from 'virtual:starlight-blog/context'

import type { StarlightBlogConfig } from './config'
import { DefaultLocale, getLocales, type Locale } from './i18n'
import { getRelativeUrl, getRelativeBlogUrl, getPathWithLocale } from './page'
import { stripLeadingSlash, stripTrailingSlash } from './path'

// A map of prefixes to a map of locales to blog entries.
const blogsEntriesPerLocale = new Map<string, Map<Locale, StarlightBlogEntry[]>>()

export async function getBlogStaticPaths() {
  const paths = []

  for (const config of configs.values()) {
    for (const locale of getLocales()) {
      const entries = await getBlogEntries(config, locale)
      const pages = getPaginatedBlogEntries(config, entries)

      for (const [index, entries] of pages.entries()) {
        paths.push(getBlogStaticPath(config, pages, entries, index, locale))
      }
    }
  }

  return paths satisfies GetStaticPathsResult
}

export async function getSidebarBlogEntries(config: StarlightBlogConfig, locale: Locale) {
  const entries = await getBlogEntries(config, locale)

  const featured: StarlightBlogEntry[] = []
  const recent: StarlightBlogEntry[] = []

  for (const entry of entries) {
    if (entry.data.featured) {
      featured.push(entry)
    } else {
      recent.push(entry)
    }
  }

  return { featured, recent: recent.slice(0, config.recentPostCount) }
}

export async function getBlogEntry(
  config: StarlightBlogConfig,
  slug: string,
  locale: Locale,
): Promise<StarlightBlogEntryPaginated> {
  const entries = await getBlogEntries(config, locale)

  const entryIndex = entries.findIndex((entry) => {
    if (entry.id === stripLeadingSlash(stripTrailingSlash(slug))) return true
    if (locale) return entry.id === stripLeadingSlash(stripTrailingSlash(getPathWithLocale(slug, undefined)))
    return false
  })
  const entry = entries[entryIndex]

  if (!entry) {
    throw new Error(`Blog post with slug '${slug}' not found.`)
  }

  validateBlogEntry(entry)

  const prevEntry = entries[entryIndex - 1]
  const prevLink = prevEntry
    ? { href: getRelativeUrl(`/${getPathWithLocale(prevEntry.id, locale)}`), label: prevEntry.data.title }
    : undefined

  const nextEntry = entries[entryIndex + 1]
  const nextLink = nextEntry
    ? { href: getRelativeUrl(`/${getPathWithLocale(nextEntry.id, locale)}`), label: nextEntry.data.title }
    : undefined

  return {
    entry,
    nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
    prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
  }
}

export async function getBlogEntries(config: StarlightBlogConfig, locale: Locale): Promise<StarlightBlogEntry[]> {
  const blogEntriesPerLocale = getBlogEntriesPerLocale(config, locale)
  if (blogEntriesPerLocale) return blogEntriesPerLocale

  const docEntries = await getCollection('docs')
  const blogEntries: StarlightEntry[] = []

  const contentRelativePath = `${context.srcDir.replace(context.rootDir, '')}content/docs/`

  for (const entry of docEntries) {
    if (import.meta.env.MODE === 'production' && entry.data.draft === true) continue

    const fileRelativePath = entry.filePath?.replace(contentRelativePath, '')

    const isDefaultLocaleEntry =
      fileRelativePath?.startsWith(`${getPathWithLocale(config.prefix, DefaultLocale)}/`) &&
      fileRelativePath !== `${getPathWithLocale(config.prefix, DefaultLocale)}/index.mdx`

    if (isDefaultLocaleEntry) {
      if (locale === DefaultLocale) {
        blogEntries.push(entry)
        continue
      }

      // Briefly override `console.warn()` to silence logging when a localized entry is not found.
      const warn = console.warn
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      console.warn = () => {}

      try {
        const localizedEntry = await getEntry('docs', getPathWithLocale(entry.id, locale))
        if (!localizedEntry) throw new Error('Unavailable localized entry.')
        if (localizedEntry.data.draft === true) throw new Error('Draft localized entry.')
        blogEntries.push(localizedEntry)
      } catch {
        blogEntries.push(entry)
      }

      // Restore the original `console.warn()` implementation.
      console.warn = warn
    }
  }

  validateBlogEntries(blogEntries)

  blogEntries.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title)
  })

  setBlogEntriesPerLocale(config, locale, blogEntries)

  return blogEntries
}

export async function getBlogEntryExcerpt(entry: StarlightBlogEntry) {
  if (entry.data.excerpt) {
    return entry.data.excerpt
  }

  const { Content } = await render(entry)

  return Content
}

function getBlogStaticPath(
  config: StarlightBlogConfig,
  pages: StarlightBlogEntry[][],
  entries: StarlightBlogEntry[],
  index: number,
  locale: Locale,
) {
  const prevPage = index === 0 ? undefined : pages.at(index - 1)
  const prevLink = prevPage ? { href: getRelativeBlogUrl(config, index === 1 ? '/' : `/${index}`, locale) } : undefined

  const nextPage = pages.at(index + 1)
  const nextLink = nextPage ? { href: getRelativeBlogUrl(config, `/${index + 2}`, locale) } : undefined

  return {
    params: {
      page: index === 0 ? undefined : `${index + 1}`,
      prefix: getPathWithLocale(config.prefix, locale),
    },
    props: {
      prefix: config.prefix,
      entries,
      locale,
      nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
      prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
    } satisfies StarlightBlogStaticProps,
  }
}

function getPaginatedBlogEntries(config: StarlightBlogConfig, entries: StarlightBlogEntry[]): StarlightBlogEntry[][] {
  const pages: StarlightBlogEntry[][] = []

  for (const entry of entries) {
    const lastPage = pages.at(-1)

    if (!lastPage || lastPage.length === config.postCount) {
      pages.push([entry])
    } else {
      lastPage.push(entry)
    }
  }

  if (pages.length === 0) {
    pages.push([])
  }

  return pages
}

// The validation of required fields is done here instead of in the zod schema directly as we do not want to require
// them for the docs.
function validateBlogEntries(entries: StarlightEntry[]): asserts entries is StarlightBlogEntry[] {
  for (const entry of entries) {
    validateBlogEntry(entry)
  }
}

function validateBlogEntry(entry: StarlightEntry): asserts entry is StarlightBlogEntry {
  if (entry.data.date === undefined) {
    throw new Error(`Missing date for blog entry '${entry.id}'.`)
  }
}

function getBlogEntriesPerLocale(config: StarlightBlogConfig, locale: Locale) {
  return blogsEntriesPerLocale.get(config.prefix)?.get(locale)
}

function setBlogEntriesPerLocale(config: StarlightBlogConfig, locale: Locale, entries: StarlightBlogEntry[]) {
  const localeCache = blogsEntriesPerLocale.get(config.prefix) ?? new Map<Locale, StarlightBlogEntry[]>()

  localeCache.set(locale, entries)
  blogsEntriesPerLocale.set(config.prefix, localeCache)
}

type StarlightEntry = CollectionEntry<'docs'>

export type StarlightBlogEntry = StarlightEntry & {
  data: {
    date: Date
  }
}

export interface StarlightBlogLink {
  href: string
  label?: string
}

export interface StarlightBlogEntryPaginated {
  entry: StarlightBlogEntry
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}

interface StarlightBlogStaticProps {
  prefix: string
  entries: StarlightBlogEntry[]
  locale: Locale
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}
