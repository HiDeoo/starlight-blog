import type { Props, StarlightPageProps } from '@astrojs/starlight/props'
import type { AstroConfig } from 'astro'
import config from 'virtual:starlight-blog-config'
import context from 'virtual:starlight-blog-context'

import type { StarlightBlogEntry } from './content'
import { ensureTrailingSlash, stripLeadingSlash, stripTrailingSlash } from './path'

const trailingSlashTransformers: Record<AstroConfig['trailingSlash'], (path: string) => string> = {
  always: ensureTrailingSlash,
  ignore: (href) => href,
  never: stripTrailingSlash,
}

const base = stripTrailingSlash(import.meta.env.BASE_URL)

export function getBlogPathWithBase(path: string, ignoreTrailingSlash = false) {
  path = stripLeadingSlash(path)

  return getPathWithBase(path ? `/${config.prefix}/${path}` : `/${config.prefix}`, ignoreTrailingSlash)
}

export function getPathWithBase(path: string, ignoreTrailingSlash = false) {
  path = stripLeadingSlash(path)
  path = path ? `${base}/${path}` : `${base}/`

  if (ignoreTrailingSlash) {
    return path
  }

  const trailingSlashTransformer = trailingSlashTransformers[context.trailingSlash]

  return trailingSlashTransformer(path)
}

export function isAnyBlogPage(slug: string) {
  return slug.match(new RegExp(`^${config.prefix}(/?$|/.+/?$)`)) !== null
}

export function isBlogRoot(slug: string) {
  return slug === config.prefix
}

export function isAnyBlogPostPage(slug: string) {
  return slug.match(new RegExp(`^${config.prefix}/(?!(\\d+/?|tags/.+)$).+$`)) !== null
}

export function isBlogPostPage(slug: string, postSlug: string) {
  return slug === postSlug
}

export function isBlogTagsPage(slug: string, tag: string) {
  return slug === `${config.prefix}/tags/${tag}`
}

export function getPageProps(title: string): StarlightPageProps {
  return {
    frontmatter: {
      pagefind: false,
      title,
      prev: false,
      next: false,
    },
  }
}

export function getSidebarProps(slug: string, entries: StarlightBlogEntry[]): Props['sidebar'] {
  return entries.map((entry) => ({
    attrs: {},
    badge: undefined,
    href: getPathWithBase(`/${entry.slug}`),
    isCurrent: isBlogPostPage(slug, entry.slug),
    label: entry.data.title,
    type: 'link',
  }))
}
