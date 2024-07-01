import type { z } from 'astro/zod'
import { getCollection, type AstroCollectionEntry } from 'astro:content'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'

import type { StarlightBlogAuthor, blogSchema } from '../schema'

import { getBlogPathWithBase, getPathWithBase } from './page'

export async function getBlogStaticPaths() {
  const entries = await getBlogEntries()

  const entryPages: StarlightBlogEntry[][] = []

  for (const entry of entries) {
    const lastPage = entryPages.at(-1)

    if (!lastPage || lastPage.length === config.postCount) {
      entryPages.push([entry])
    } else {
      lastPage.push(entry)
    }
  }

  if (entryPages.length === 0) {
    entryPages.push([])
  }

  return entryPages.map((entries, index) => {
    const prevPage = index === 0 ? undefined : entryPages.at(index - 1)
    const prevLink = prevPage
      ? { href: getBlogPathWithBase(index === 1 ? '/' : `/${index}`), label: 'Newer posts' }
      : undefined

    const nextPage = entryPages.at(index + 1)
    const nextLink = nextPage ? { href: getBlogPathWithBase(`/${index + 2}`), label: 'Older posts' } : undefined

    return {
      params: {
        page: index === 0 ? undefined : index + 1,
        prefix: config.prefix,
      },
      props: {
        entries,
        nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
        prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
      } satisfies StarlightBlogStaticProps,
    }
  })
}

export async function getRecentBlogEntries() {
  const entries = await getBlogEntries()

  return entries.slice(0, config.recentPostCount)
}

export async function getBlogEntry(slug: string): Promise<StarlightBlogEntryPaginated> {
  const entries = await getBlogEntries()

  const entryIndex = entries.findIndex((entry) => entry.slug === slug.replace(/^\//, '').replace(/\/$/, ''))
  const entry = entries[entryIndex]

  if (!entry) {
    throw new Error(`Blog post with slug '${slug}' not found.`)
  }

  validateBlogEntry(entry)

  const prevEntry = entries[entryIndex - 1]
  const prevLink = prevEntry ? { href: getPathWithBase(`/${prevEntry.slug}`), label: prevEntry.data.title } : undefined

  const nextEntry = entries[entryIndex + 1]
  const nextLink = nextEntry ? { href: getPathWithBase(`/${nextEntry.slug}`), label: nextEntry.data.title } : undefined

  return {
    entry,
    nextLink: config.prevNextLinksOrder === 'reverse-chronological' ? nextLink : prevLink,
    prevLink: config.prevNextLinksOrder === 'reverse-chronological' ? prevLink : nextLink,
  }
}

export function getBlogEntryMetadata(entry: StarlightBlogEntry): StarlightBlogEntryMetadata {
  const authors: StarlightBlogAuthor[] = []

  if (!entry.data.authors) {
    authors.push(...Object.values(config.authors))
  } else if (typeof entry.data.authors === 'string') {
    authors.push(getAuthorFromConfig(entry.data.authors))
  } else if (Array.isArray(entry.data.authors)) {
    for (const author of entry.data.authors) {
      if (typeof author === 'string') {
        authors.push(getAuthorFromConfig(author))
      } else {
        authors.push(author)
      }
    }
  } else {
    authors.push(entry.data.authors)
  }

  return {
    authors,
    date: entry.data.date.toLocaleDateString(starlightConfig.defaultLocale.lang, { dateStyle: 'medium' }),
    updateDate: entry.data.updateDate?.toLocaleDateString(starlightConfig.defaultLocale.lang, { dateStyle: 'medium' }),
  }
}

export async function getBlogEntries() {
  const entries = await getCollection<StarlightEntryData>('docs', ({ id, data }) => {
    return (
      id.startsWith(`${config.prefix}/`) &&
      id !== `${config.prefix}/index.mdx` &&
      (import.meta.env.MODE !== 'production' || data.draft === false)
    )
  })

  validateBlogEntries(entries)

  return entries.sort((a, b) => {
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

function getAuthorFromConfig(id: string): StarlightBlogAuthor {
  const author = config.authors[id]

  if (!author) {
    throw new Error(`Author '${id}' not found in the blog configuration.`)
  }

  return author
}

type StarlightEntryData = z.infer<ReturnType<typeof blogSchema>> & { draft?: boolean; title: string }
type StarlightEntry = AstroCollectionEntry<StarlightEntryData>

export type StarlightBlogEntry = StarlightEntry & {
  data: {
    date: Date
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
  updateDate: string | undefined
}

interface StarlightBlogStaticProps {
  entries: StarlightBlogEntry[]
  nextLink: StarlightBlogLink | undefined
  prevLink: StarlightBlogLink | undefined
}
