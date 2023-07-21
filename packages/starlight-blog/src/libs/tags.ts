import { slug } from 'github-slugger'

import type { StarlightBlogEntry } from './content'

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
