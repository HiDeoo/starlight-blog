import { slug } from 'github-slugger'

import { getBlogEntries, type StarlightBlogEntry } from './content'

export async function getTagsStaticPaths() {
  const entries = await getBlogEntries()
  const entryTags = new Map<string, StarlightBlogEntry[]>()

  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      const entries = entryTags.get(tag.slug) ?? []

      entries.push(entry)

      entryTags.set(tag.slug, entries)
    }
  }

  return [...entryTags.entries()].map(([slug, entries]) => {
    return {
      params: {
        tag: slug,
      },
      props: {
        entries,
      },
    }
  })
}

export function getEntryTags(entry: StarlightBlogEntry): StarlightBlogEntryTag[] {
  return (entry.data.tags ?? []).map((tag) => {
    return {
      name: tag,
      slug: slugifyTag(tag),
    }
  })
}

function slugifyTag(tag: string) {
  return slug(tag)
}

interface StarlightBlogEntryTag {
  name: string
  slug: string
}
