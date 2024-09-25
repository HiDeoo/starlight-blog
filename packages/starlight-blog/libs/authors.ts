import { slug } from 'github-slugger'
import config from 'virtual:starlight-blog-config'

import type { StarlightBlogAuthor } from '../schema'

import { getBlogEntries, type StarlightBlogEntry } from './content'

export async function getAllAuthors(): Promise<StarlightBlogEntryAuthors> {
  const entries = await getBlogEntries()
  const entryAuthors: StarlightBlogEntryAuthors = new Map()

  for (const entry of entries) {
    for (const author of getEntryAuthors(entry)) {
      const infos = entryAuthors.get(author.name) ?? { entries: [], author: { ...author, slug: slug(author.name) } }

      infos.entries.push(entry)

      entryAuthors.set(author.name, infos)
    }
  }

  return entryAuthors
}

export async function getAuthorsStaticPaths() {
  const entryAuthors = await getAllAuthors()

  return [...entryAuthors.values()].map(({ entries, author }) => {
    return {
      params: {
        prefix: config.prefix,
        author: author.slug,
      },
      props: {
        entries,
        author,
      },
    }
  })
}

export function getEntryAuthors(entry: StarlightBlogEntry): StarlightBlogAuthor[] {
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

  return authors
}

function getAuthorFromConfig(id: string): StarlightBlogAuthor {
  const author = config.authors[id]

  if (!author) {
    throw new Error(`Author '${id}' not found in the blog configuration.`)
  }

  return author
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
