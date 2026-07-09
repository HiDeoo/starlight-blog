import type { GetStaticPathsResult } from 'astro'
import { slug } from 'github-slugger'
import configs from 'virtual:starlight-blog/configs'

import type { StarlightBlogAuthor } from '../schema'

import type { StarlightBlogConfig } from './config'
import { getBlogEntries, type StarlightBlogEntry } from './content'
import { getLocales, type Locale } from './i18n'
import { getPathWithLocale } from './page'

export async function getAllAuthors(config: StarlightBlogConfig, locale: Locale): Promise<StarlightBlogEntryAuthors> {
  const entries = await getBlogEntries(config, locale)
  const entryAuthors: StarlightBlogEntryAuthors = new Map()

  for (const entry of entries) {
    for (const author of getEntryAuthors(config, entry)) {
      const infos = entryAuthors.get(author.name) ?? {
        entries: [],
        author: { ...author, slug: getAuthorSlug(author.name) },
      }

      infos.entries.push(entry)

      entryAuthors.set(author.name, infos)
    }
  }

  return entryAuthors
}

export async function getAuthorsStaticPaths() {
  const paths = []

  for (const config of configs.values()) {
    for (const locale of getLocales()) {
      const entryAuthors = await getAllAuthors(config, locale)

      for (const [, { author, entries }] of entryAuthors.entries()) {
        paths.push(getAuthorsStaticPath(config, entries, author, locale))
      }
    }
  }

  return paths satisfies GetStaticPathsResult
}

export function getEntryAuthors(config: StarlightBlogConfig, entry: StarlightBlogEntry): StarlightBlogAuthor[] {
  const authors: StarlightBlogAuthor[] = []

  if (!entry.data.authors) {
    authors.push(...Object.values(config.authors))
  } else if (typeof entry.data.authors === 'string') {
    authors.push(getAuthorFromConfig(config, entry.data.authors))
  } else if (Array.isArray(entry.data.authors)) {
    for (const author of entry.data.authors) {
      if (typeof author === 'string') {
        authors.push(getAuthorFromConfig(config, author))
      } else {
        authors.push(author)
      }
    }
  } else {
    authors.push(entry.data.authors)
  }

  return authors
}

export function getAuthorSlug(name: string) {
  return slug(name)
}

function getAuthorFromConfig(config: StarlightBlogConfig, id: string): StarlightBlogAuthor {
  const author = config.authors[id]

  if (!author) {
    throw new Error(`Author '${id}' not found in the blog configuration.`)
  }

  return author
}

function getAuthorsStaticPath(
  config: StarlightBlogConfig,
  entries: StarlightBlogEntry[],
  author: StarlightBlogEntryAuthor,
  locale: Locale,
) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
      author: author.slug,
    },
    props: {
      prefix: config.prefix,
      author,
      entries,
      locale,
    },
  }
}

type StarlightBlogEntryAuthorSlug = string

interface StarlightBlogEntryAuthor extends StarlightBlogAuthor {
  slug: StarlightBlogEntryAuthorSlug
}

type StarlightBlogEntryAuthors = Map<
  StarlightBlogEntryAuthorSlug,
  {
    entries: StarlightBlogEntry[]
    author: StarlightBlogEntryAuthor
  }
>
