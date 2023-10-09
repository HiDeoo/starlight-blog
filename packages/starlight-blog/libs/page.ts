import type { Props } from '@astrojs/starlight/props'
import starlightConfig from 'virtual:starlight/user-config'

export function isAnyBlogPage(slug: Props['slug']) {
  return slug.match(/^blog(\/?$|\/.+\/?$)/) !== null
}

export function isBlogRoot(slug: Props['slug']) {
  return slug === 'blog'
}

export function isAnyBlogPostPage(slug: Props['slug']) {
  return slug.match(/^blog\/(?!(\d+\/?|tags\/.+)$).+$/) !== null
}

export function isBlogPostPage(slug: Props['slug'], postSlug: Props['slug']) {
  return slug === postSlug
}

export function isBlogTagsPage(slug: Props['slug'], tag: string) {
  return slug === `blog/tags/${tag}`
}

export function getPageProps(title: string, slug: string): Props {
  const entryMeta = getEntryMeta()

  return {
    ...entryMeta,
    editUrl: undefined,
    entry: {
      data: {
        head: [],
        pagefind: false,
        title,
      },
      slug,
    },
    entryMeta,
    hasSidebar: true,
    headings: [],
    id: slug,
    lastUpdated: undefined,
    pagination: {
      next: undefined,
      prev: undefined,
    },
    sidebar: [],
    slug,
    toc: {
      items: [],
      maxHeadingLevel: 0,
      minHeadingLevel: 0,
    },
  }
}

function getEntryMeta() {
  const dir = starlightConfig.defaultLocale.dir
  const lang = starlightConfig.defaultLocale.lang ?? 'en'
  let locale = starlightConfig.defaultLocale.locale

  if (locale === 'root') {
    locale = undefined
  }

  return { dir, lang, locale }
}
