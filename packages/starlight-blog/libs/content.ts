import type { GetStaticPathsResult } from 'astro'
import { type CollectionEntry, getCollection, getEntry, render } from 'astro:content'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'
import context from 'virtual:starlight-blog-context'

import { DefaultLocale, type Locale } from './i18n'
import { getRelativeUrl, getRelativeBlogUrl, getPathWithLocale } from './page'
import { stripLeadingSlash, stripTrailingSlash } from './path'

const blogEntriesPerLocale = new Map<Locale, StarlightBlogEntry[]>()

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

export async function getBlogEntries(locale: Locale): Promise<StarlightBlogEntry[]> {
  if (blogEntriesPerLocale.has(locale)) {
    return blogEntriesPerLocale.get(locale) as StarlightBlogEntry[]
  }

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

  blogEntriesPerLocale.set(locale, blogEntries)

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
  pages: StarlightBlogEntry[][],
  entries: StarlightBlogEntry[],
  index: number,
  locale: Locale,
) {
  const prevPage = index === 0 ? undefined : pages.at(index - 1)
  const prevLink = prevPage ? { href: getRelativeBlogUrl(index === 1 ? '/' : `/${index}`, locale) } : undefined

  const nextPage = pages.at(index + 1)
  const nextLink = nextPage ? { href: getRelativeBlogUrl(`/${index + 2}`, locale) } : undefined

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
  entries: StarlightBlogEntry[]
  locale: Locale
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}
