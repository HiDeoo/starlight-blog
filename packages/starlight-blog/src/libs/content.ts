import type { z } from 'astro/zod'
import { getCollection, type AstroCollectionEntry } from 'astro:content'

import type { docsAndBlogSchema } from './schema'

export async function getBlogStaticPaths() {
  const entries = await getBlogEntries()

  validateBlogEntries(entries)

  // TODO(HiDeoo) FIO pages
  // TODO(HiDeoo) pass down entries to each pages
  // TODO(HiDeoo) Handle no blog post
  return [
    {
      params: {
        page: undefined,
      },
    },
    {
      params: {
        page: '1',
      },
    },
  ]
}

// TODO(HiDeoo) limit
export async function getRecentBlogEntries() {
  return getBlogEntries()
}

function getBlogEntries() {
  // TODO(HiDeoo) order
  return getCollection<StarlightEntryData>('docs', ({ id }) => {
    return id.startsWith('blog/') && id !== 'blog/index.mdx'
  })
}

function validateBlogEntries(entries: StarlightEntry[]): asserts entries is StarlightBlogEntry[] {
  for (const entry of entries) {
    if (entry.data.date === undefined) {
      throw new Error(`Missing date for blog entry '${entry.id}'.`)
    }
  }
}

type StarlightEntryData = z.infer<ReturnType<typeof docsAndBlogSchema>>
type StarlightEntry = AstroCollectionEntry<StarlightEntryData>

type StarlightBlogEntry = StarlightEntry & {
  data: {
    date: string
  }
}
