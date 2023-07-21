import type { z } from 'astro/zod'
import { getCollection, getEntry, type AstroCollectionEntry } from 'astro:content'
import config from 'virtual:starlight-blog-config'

import type { docsAndBlogSchema } from './schema'

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

  // TODO(HiDeoo) Handle no blog post
  return entryPages.map((entries, index) => {
    const prevPage = index === 0 ? undefined : entryPages.at(index - 1)
    const nextPage = entryPages.at(index + 1)

    return {
      params: {
        page: index === 0 ? undefined : index + 1,
      },
      props: {
        entries,
        nextHref: nextPage ? `/blog/${index + 2}` : undefined,
        prevHref: prevPage ? (index === 1 ? '/blog' : `/blog/${index}`) : undefined,
      } satisfies StarlightBlogStaticProps,
    }
  })
}

export async function getRecentBlogEntries() {
  const entries = await getBlogEntries()

  return entries.slice(0, config.recentPostCount)
}

export async function getBlogEntry(slug: string) {
  const entry = await getEntry<StarlightEntryData>('docs', slug.replace(/^\//, '').replace(/\/$/, ''))

  if (!entry) {
    throw new Error(`Blog post with slug '${slug}' not found.`)
  }

  validateBlogEntry(entry)

  return entry
}

async function getBlogEntries() {
  const entries = await getCollection<StarlightEntryData>('docs', ({ id }) => {
    return id.startsWith('blog/') && id !== 'blog/index.mdx'
  })

  validateBlogEntries(entries)

  return entries.sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime()
  })
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

type StarlightEntryData = z.infer<ReturnType<typeof docsAndBlogSchema>>
type StarlightEntry = AstroCollectionEntry<StarlightEntryData>

export type StarlightBlogEntry = StarlightEntry & {
  data: {
    date: Date
  }
}

interface StarlightBlogStaticProps {
  entries: StarlightBlogEntry[]
  nextHref: string | undefined
  prevHref: string | undefined
}
