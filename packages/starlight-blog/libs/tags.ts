import { slug } from 'github-slugger'
import config from 'virtual:starlight-blog-config'

import { getBlogEntries, type StarlightBlogEntry } from './content'

export async function getAllTags(): Promise<StarlightBlogEntryTags> {
  const entries = await getBlogEntries()
  const entryTags: StarlightBlogEntryTags = new Map()

  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      const infos = entryTags.get(tag.slug) ?? { entries: [], label: tag.label }

      infos.entries.push(entry)

      entryTags.set(tag.slug, infos)
    }
  }

  return entryTags
}

export async function getTagsStaticPaths() {
  const entryTags = await getAllTags()

  return [...entryTags.entries()].map(([slug, { entries, label }]) => {
    return {
      params: {
        prefix: config.prefix,
        tag: slug,
      },
      props: {
        entries,
        label,
        tag: slug,
      },
    }
  })
}

export function getEntryTags(entry: StarlightBlogEntry): StarlightBlogEntryTag[] {
  return (entry.data.tags ?? []).map((tag) => {
    return {
      label: tag,
      slug: slug(tag),
    }
  })
}

type StarlightBlogEntryTagSlug = string

interface StarlightBlogEntryTag {
  label: string
  slug: StarlightBlogEntryTagSlug
}

type StarlightBlogEntryTags = Map<
  StarlightBlogEntryTagSlug,
  {
    entries: StarlightBlogEntry[]
    label: StarlightBlogEntryTag['label']
  }
>
