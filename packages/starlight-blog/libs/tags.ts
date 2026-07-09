import type { GetStaticPathsResult } from 'astro'
import { slug } from 'github-slugger'
import configs from 'virtual:starlight-blog/configs'

import type { StarlightBlogConfig } from './config'
import { getBlogEntries, type StarlightBlogEntry } from './content'
import { getLocales, type Locale } from './i18n'
import { getPathWithLocale } from './page'

export async function getAllTags(config: StarlightBlogConfig, locale: Locale): Promise<StarlightBlogEntryTags> {
  const entries = await getBlogEntries(config, locale)
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
  const paths = []

  for (const config of configs.values()) {
    for (const locale of getLocales()) {
      const entryTags = await getAllTags(config, locale)

      for (const [slug, { entries, label }] of entryTags.entries()) {
        paths.push(getTagsStaticPath(config, entries, slug, label, locale))
      }
    }
  }

  return paths satisfies GetStaticPathsResult
}

export function getEntryTags(entry: StarlightBlogEntry): StarlightBlogEntryTag[] {
  return (entry.data.tags ?? []).map((tag) => {
    return {
      label: tag,
      slug: slug(tag),
    }
  })
}

function getTagsStaticPath(
  config: StarlightBlogConfig,
  entries: StarlightBlogEntry[],
  slug: string,
  label: string,
  locale: Locale,
) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
      tag: slug,
    },
    props: {
      prefix: config.prefix,
      entries,
      label,
      locale,
      tag: slug,
    },
  }
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
