import type { StarlightPageProps } from '@astrojs/starlight/props'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import type { AstroConfig } from 'astro'
import configs from 'virtual:starlight-blog/configs'
import context from 'virtual:starlight-blog/context'

import type { StarlightBlogConfig } from './config'
import type { StarlightBlogEntry } from './content'
import type { Locale } from './i18n'
import { ensureTrailingSlash, stripLeadingSlash, stripTrailingSlash } from './path'

const trailingSlashTransformers: Record<AstroConfig['trailingSlash'], (path: string) => string> = {
  always: ensureTrailingSlash,
  ignore: ensureTrailingSlash,
  never: stripTrailingSlash,
}

const base = stripTrailingSlash(import.meta.env.BASE_URL)

export function getBlogConfig(prefix: string): StarlightBlogConfig {
  const blog = configs.get(prefix)
  if (!blog) throw new Error(`Failed to get blog config for prefix '${prefix}'.`)
  return blog
}

export function getBlogConfigFromPath(path: string): StarlightBlogConfig | undefined {
  const slug = stripTrailingSlash(stripLeadingSlash(path))
  const locale = getLocaleFromPath(slug)

  for (const blog of configs.values()) {
    const prefix = getPathWithLocale(blog.prefix, locale)

    if (slug === prefix || slug.startsWith(`${prefix}/`)) {
      return blog
    }
  }

  return
}

/** Get the relative URL of a blog page taking into account the locale, base URL and trailing slash configuration. */
export function getRelativeBlogUrl(
  config: StarlightBlogConfig,
  path: string,
  locale: Locale,
  ignoreTrailingSlash = false,
) {
  path = stripLeadingSlash(path)

  return getRelativeUrl(
    getPathWithLocale(path ? `/${config.prefix}/${path}` : `/${config.prefix}`, locale),
    ignoreTrailingSlash,
  )
}

/** Get the relative URL of a page taking into account the base URL and the trailing slash configuration. */
export function getRelativeUrl(path: string, ignoreTrailingSlash = false) {
  path = stripLeadingSlash(path)
  path = path ? `${base}/${path}` : `${base}/`

  if (ignoreTrailingSlash) {
    return path
  }

  const trailingSlashTransformer = trailingSlashTransformers[context.trailingSlash]

  return trailingSlashTransformer(path)
}

export function getPathWithLocale(path: string, locale: Locale): string {
  const pathLocale = getLocaleFromPath(path)
  if (pathLocale === locale) return path
  locale = locale ?? ''
  if (pathLocale === path) return locale
  if (pathLocale) return stripTrailingSlash(path.replace(`${pathLocale}/`, locale ? `${locale}/` : ''))
  return path ? `${stripTrailingSlash(locale)}/${stripLeadingSlash(path)}` : locale
}

export function isAnyBlogPostPage(config: StarlightBlogConfig, slug: string) {
  return (
    new RegExp(
      `^${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/(?!(\\d+/?|tags/.+|authors/.+)$).+$`,
    ).exec(slug) !== null
  )
}

export function isBlogRoot(config: StarlightBlogConfig, slug: string) {
  return slug === getPathWithLocale(config.prefix, getLocaleFromPath(slug))
}

export function isBlogPaginationPage(config: StarlightBlogConfig, slug: string) {
  return new RegExp(`^${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/\\d+/?$`).exec(slug) !== null
}

export function isBlogPostPage(slug: string, postSlug: string) {
  return slug === postSlug
}

export function isAnyBlogTagPage(config: StarlightBlogConfig, slug: string) {
  return new RegExp(`^${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/tags/.+/?$`).exec(slug) !== null
}

export function isBlogTagPage(config: StarlightBlogConfig, slug: string, tag: string) {
  return slug === `${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/tags/${tag}`
}

export function isBlogAuthorPage(config: StarlightBlogConfig, slug: string, author: string) {
  return slug === `${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/authors/${author}`
}

export function isAnyBlogAuthorPage(config: StarlightBlogConfig, slug: string) {
  return new RegExp(`^${getPathWithLocale(config.prefix, getLocaleFromPath(slug))}/authors/.+/?$`).exec(slug) !== null
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

export function getSidebarProps(
  slug: string,
  entries: StarlightBlogEntry[],
  locale: Locale,
): StarlightRouteData['sidebar'] {
  return entries.map((entry) => {
    const localizedEntrySlug = getPathWithLocale(entry.id, locale)
    return {
      attrs: {},
      badge: undefined,
      href: getRelativeUrl(`/${localizedEntrySlug}`),
      isCurrent: isBlogPostPage(slug, localizedEntrySlug),
      label: entry.data.title,
      type: 'link',
    }
  })
}

export function getLocaleFromPath(path: string): Locale {
  const baseSegment = path.split('/')[0]
  return context.locales && baseSegment && baseSegment in context.locales ? baseSegment : undefined
}

export function getLocaleFromRelativeUrl(url: string): Locale {
  const path = base && (url === base || url.startsWith(`${base}/`)) ? url.slice(base.length) : url
  return getLocaleFromPath(stripLeadingSlash(path))
}
