import type { GetStaticPathsResult } from 'astro'
import type { z } from 'astro/zod'
import { getCollection, getEntry, type AstroCollectionEntry } from 'astro:content'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'

import type { blogSchema, StarlightBlogAuthor } from '../schema'

import { getEntryAuthors } from './authors'
import { DefaultLocale, getLangFromLocale, type Locale } from './i18n'
import { getRelativeUrl, getRelativeBlogUrl, getPathWithLocale } from './page'
import { stripLeadingSlash, stripTrailingSlash } from './path'

export async function getBlogStaticPaths() {
  const paths = []

  if (starlightConfig.isMultilingual) {
    for (const localeKey of Object.keys(starlightConfig.locales)) {
      const locale = localeKey === 'root' ? undefined : localeKey

      const entries = await getBlogEntries(locale)
      const pages = getPaginatedBlogEntries(entries)

      for (const [index, entries] of pages.entries()) {
        paths.push(getBlogStaticPath(pages, entries, index, locale))
      }
    }
  } else {
    const entries = await getBlogEntries(DefaultLocale)
    const pages = getPaginatedBlogEntries(entries)

    for (const [index, entries] of pages.entries()) {
      paths.push(getBlogStaticPath(pages, entries, index, DefaultLocale))
    }
  }

  return paths satisfies GetStaticPathsResult
}

export async function getSidebarBlogEntries(locale: Locale) {
  const entries = await getBlogEntries(locale)

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

export async function getBlogEntry(slug: string, locale: Locale): Promise<StarlightBlogEntryPaginated> {
  const entries = await getBlogEntries(locale)

  const entryIndex = entries.findIndex((entry) => {
    if (entry.slug === stripLeadingSlash(stripTrailingSlash(slug))) return true
    if (locale) return entry.slug === stripLeadingSlash(stripTrailingSlash(getPathWithLocale(slug, undefined)))
    return false
  })
  const entry = entries[entryIndex]

  if (!entry) {
    throw new Error(`Blog post with slug '${slug}' not found.`)
  }

  validateBlogEntry(entry)

  const prevEntry = entries[entryIndex - 1]
  const prevLink = prevEntry
    ? { href: getRelativeUrl(`/${getPathWithLocale(prevEntry.slug, locale)}`), label: prevEntry.data.title }
    : undefined

  const nextEntry = entries[entryIndex + 1]
  const nextLink = nextEntry
    ? { href: getRelativeUrl(`/${getPathWithLocale(nextEntry.slug, locale)}`), label: nextEntry.data.title }
    : undefined

  return {
    entry,
    nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
    prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
  }
}

export function getBlogEntryMetadata(entry: StarlightBlogEntry, locale: Locale): StarlightBlogEntryMetadata {
  return {
    authors: getEntryAuthors(entry),
    date: entry.data.date.toLocaleDateString(getLangFromLocale(locale), { dateStyle: 'medium' }),
    lastUpdated:
      typeof entry.data.lastUpdated === 'boolean'
        ? undefined
        : entry.data.lastUpdated?.toLocaleDateString(getLangFromLocale(locale), {
            dateStyle: 'medium',
          }),
  }
}

export async function getBlogEntries(locale: Locale) {
  const docEntries = await getCollection<StarlightEntryData>('docs')
  const blogEntries: AstroCollectionEntry<StarlightEntryData>[] = []

  for (const entry of docEntries) {
    if (import.meta.env.MODE === 'production' && entry.data.draft === true) continue

    const isDefaultLocaleEntry =
      entry.id.startsWith(`${getPathWithLocale(config.prefix, DefaultLocale)}/`) &&
      entry.id !== `${getPathWithLocale(config.prefix, DefaultLocale)}/index.mdx`

    if (isDefaultLocaleEntry) {
      if (locale === DefaultLocale) {
        blogEntries.push(entry)
        continue
      }

      try {
        const localizedEntry = await getEntry<StarlightEntryData>('docs', getPathWithLocale(entry.slug, locale))
        if (localizedEntry.data.draft === true) throw new Error('Draft localized entry.')
        blogEntries.push(localizedEntry)
      } catch {
        blogEntries.push(entry)
      }
    }
  }

  validateBlogEntries(blogEntries)

  return blogEntries.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime()
  })
}

export async function getBlogEntryExcerpt(entry: StarlightBlogEntry) {
  if (entry.data.excerpt) {
    return entry.data.excerpt
  }

  const { Content } = await entry.render()

  return Content
}

function getBlogStaticPath(
  pages: StarlightBlogEntry[][],
  entries: StarlightBlogEntry[],
  index: number,
  locale: Locale,
) {
  const prevPage = index === 0 ? undefined : pages.at(index - 1)
  const prevLink = prevPage
    ? { href: getRelativeBlogUrl(index === 1 ? '/' : `/${index}`, locale), label: 'Newer posts' }
    : undefined

  const nextPage = pages.at(index + 1)
  const nextLink = nextPage ? { href: getRelativeBlogUrl(`/${index + 2}`, locale), label: 'Older posts' } : undefined

  return {
    params: {
      page: index === 0 ? undefined : index + 1,
      prefix: getPathWithLocale(config.prefix, locale),
    },
    props: {
      entries,
      locale,
      nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
      prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
    } satisfies StarlightBlogStaticProps,
  }
}

function getPaginatedBlogEntries(entries: StarlightBlogEntry[]): StarlightBlogEntry[][] {
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

type StarlightEntryData = z.infer<ReturnType<typeof blogSchema>> & { draft?: boolean; title: string }
type StarlightEntry = AstroCollectionEntry<StarlightEntryData>

export type StarlightBlogEntry = StarlightEntry & {
  data: {
    date: Date
    lastUpdated?: Date | boolean
  }
}

export interface StarlightBlogLink {
  href: string
  label: string
}

export interface StarlightBlogEntryPaginated {
  entry: StarlightBlogEntry
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}

interface StarlightBlogEntryMetadata {
  authors: StarlightBlogAuthor[]
  date: string
  lastUpdated: string | undefined
}

interface StarlightBlogStaticProps {
  entries: StarlightBlogEntry[]
  locale: Locale
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}
