import type { GetStaticPathsResult } from 'astro'
import { slug } from 'github-slugger'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'

import { getBlogEntries, type StarlightBlogEntry } from './content'
import { DefaultLocale, type Locale } from './i18n'
import { getPathWithLocale } from './page'

export async function getAllTags(locale: Locale): Promise<StarlightBlogEntryTags> {
  const entries = await getBlogEntries(locale)
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

  if (starlightConfig.isMultilingual) {
    for (const localeKey of Object.keys(starlightConfig.locales)) {
      const locale = localeKey === 'root' ? undefined : localeKey

      const entryTags = await getAllTags(locale)

      for (const [slug, { entries, label }] of entryTags.entries()) {
        paths.push(getTagsStaticPath(entries, slug, label, locale))
      }
    }
  } else {
    const entryTags = await getAllTags(DefaultLocale)

    for (const [slug, { entries, label }] of entryTags.entries()) {
      paths.push(getTagsStaticPath(entries, slug, label, DefaultLocale))
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

function getTagsStaticPath(entries: StarlightBlogEntry[], slug: string, label: string, locale: Locale) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
      tag: slug,
    },
    props: {
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
