import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext, AstroBuiltinAttributes } from 'astro'
import { AstroError } from 'astro/errors'
import type { HTMLAttributes } from 'astro/types'
import configs from 'virtual:starlight-blog/configs'

import type { StarlightBlogData } from './data'
import { getAllAuthors, getEntryAuthors } from './libs/authors'
import type { StarlightBlogConfig } from './libs/config'
import { renderBlogEntryToString } from './libs/container'
import { getBlogEntries, getSidebarBlogEntries } from './libs/content'
import type { Locale } from './libs/i18n'
import { getMetrics } from './libs/metrics'
import { isNavigationWithSidebarLink } from './libs/navigation'
import {
  getBlogConfigFromPath,
  getPathWithLocale,
  getRelativeBlogUrl,
  getRelativeUrl,
  getSidebarProps,
  isBlogAuthorPage,
  isBlogRoot,
  isBlogTagPage,
} from './libs/page'
import { addStructuredData } from './libs/structured-data'
import { getAllTags, getEntryTags } from './libs/tags'
import { getBlogTitle } from './libs/title'

// A map of prefixes to a map of locales to blog data.
const blogsDataPerLocale = new Map<string, Map<Locale, StarlightBlogData>>()

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals
  const { id, locale } = starlightRoute

  const blogsData = new Map(
    await Promise.all(
      [...configs.values()].map(
        async (config) => [config.prefix, await getBlogData(config, starlightRoute, context.locals.t)] as const,
      ),
    ),
  )

  context.locals.starlightBlogs = blogsData

  Object.defineProperty(context.locals, 'starlightBlog', {
    configurable: true,
    enumerable: true,
    get() {
      if (configs.size > 1) {
        throw new AstroError(
          '`locals.starlightBlog` is not defined',
          '`locals.starlightBlog` is not available when multiple blog instances are configured.\n' +
            'Use `locals.starlightBlogs.get(prefix)` instead.',
        )
      }

      const [config] = configs.values()
      if (!config) throw new Error('No blog instance configured.')

      const data = context.locals.starlightBlogs.get(config.prefix)
      if (!data) throw new Error(`Missing blog data for the configured blog instance with prefix '${config.prefix}'.`)

      return data
    },
  })

  const config = getBlogConfigFromPath(id)

  if (!config) {
    for (const blog of [...configs.values()].toReversed()) {
      if (isNavigationWithSidebarLink(blog)) {
        starlightRoute.sidebar.unshift(
          makeSidebarLink(getBlogTitle(blog, locale), getRelativeBlogUrl(blog, '/', locale), false, {
            class: 'sl-blog-mobile-link',
          }),
        )
      }
    }

    return
  }

  if (config.structuredData) addStructuredData(config, context)

  starlightRoute.sidebar = await getBlogSidebar(config, context)
})

export async function getBlogData(
  config: StarlightBlogConfig,
  { locale }: Pick<StarlightRouteData, 'locale'>,
  t: App.Locals['t'],
): Promise<StarlightBlogData> {
  const blogDataPerLocale = getBlogDataPerLocale(config, locale)
  if (blogDataPerLocale) return blogDataPerLocale

  const posts = await getBlogPostsData(config, locale, t)

  const authors = new Map<string, StarlightBlogData['authors'][number]>()

  for (const post of posts) {
    for (const author of post.authors) {
      if (authors.has(author.name)) continue
      authors.set(author.name, author)
    }
  }

  const blogData: StarlightBlogData = { posts, authors: [...authors.values()] }

  setBlogDataPerLocale(config, locale, blogData)

  return blogData
}

async function getBlogPostsData(
  config: StarlightBlogConfig,
  locale: Locale,
  t: App.Locals['t'],
): Promise<StarlightBlogData['posts']> {
  const entries = await getBlogEntries(config, locale)

  return Promise.all(
    entries.map(async (entry) => {
      const authors = getEntryAuthors(config, entry)
      const tags = getEntryTags(entry)
      const html = await renderBlogEntryToString(entry, t)
      const metrics = getMetrics(html, locale, entry.data.metrics)

      const postsData: StarlightBlogData['posts'][number] = {
        authors: authors.map(({ name, title, url }) => ({
          name,
          title,
          url,
        })),
        cover: entry.data.cover,
        createdAt: entry.data.date,
        draft: entry.data.draft,
        entry: entry,
        featured: entry.data.featured === true,
        href: getRelativeUrl(`/${getPathWithLocale(entry.id, locale)}`),
        metrics,
        tags: tags.map(({ label, slug }) => ({
          label,
          href: getRelativeBlogUrl(config, `/tags/${slug}`, locale),
        })),
        title: entry.data.title,
      }

      if (entry.data.lastUpdated && typeof entry.data.lastUpdated !== 'boolean') {
        postsData.updatedAt = entry.data.lastUpdated
      }

      return postsData
    }),
  )
}

async function getBlogSidebar(
  config: StarlightBlogConfig,
  context: APIContext,
): Promise<StarlightRouteData['sidebar']> {
  const { starlightRoute, t } = context.locals
  const { id, locale } = starlightRoute

  const { featured, recent } = await getSidebarBlogEntries(config, locale)

  const sidebar: StarlightRouteData['sidebar'] = [
    makeSidebarLink(t('starlightBlog.sidebar.all'), getRelativeBlogUrl(config, '/', locale), isBlogRoot(config, id)),
  ]

  if (featured.length > 0) {
    sidebar.push(makeSidebarGroup(t('starlightBlog.sidebar.featured'), getSidebarProps(id, featured, locale)))
  }

  sidebar.push(makeSidebarGroup(t('starlightBlog.sidebar.recent'), getSidebarProps(id, recent, locale)))

  const tags = await getAllTags(config, locale)

  if (tags.size > 0) {
    sidebar.push(
      makeSidebarGroup(
        t('starlightBlog.sidebar.tags'),
        [...tags]
          .toSorted(([, a], [, b]) => {
            if (a.entries.length === b.entries.length) {
              return a.label.localeCompare(b.label)
            }

            return b.entries.length - a.entries.length
          })
          .map(([tagSlug, { entries, label }]) =>
            makeSidebarLink(
              `${label} (${entries.length})`,
              getRelativeBlogUrl(config, `/tags/${tagSlug}`, locale),
              isBlogTagPage(config, id, tagSlug),
            ),
          ),
      ),
    )
  }

  const authors = await getAllAuthors(config, locale)

  if (authors.size > 1) {
    sidebar.push(
      makeSidebarGroup(
        t('starlightBlog.sidebar.authors'),
        [...authors]
          .toSorted(([, a], [, b]) => {
            if (a.entries.length === b.entries.length) {
              return a.author.name.localeCompare(b.author.name)
            }

            return b.entries.length - a.entries.length
          })
          .map(([, { author, entries }]) =>
            makeSidebarLink(
              `${author.name} (${entries.length})`,
              getRelativeBlogUrl(config, `/authors/${author.slug}`, locale),
              isBlogAuthorPage(config, id, author.slug),
            ),
          ),
      ),
    )
  }

  if (context.site && config.rss) {
    sidebar.push(
      makeSidebarLink(t('starlightBlog.sidebar.rss'), getRelativeBlogUrl(config, '/rss.xml', locale, true), false),
    )
  }

  return sidebar
}

function makeSidebarLink(
  label: string,
  href: string,
  isCurrent: boolean,
  attributes?: Omit<HTMLAttributes<'a'>, keyof AstroBuiltinAttributes | 'children'>,
) {
  return {
    attrs: attributes ?? {},
    badge: undefined,
    href,
    isCurrent,
    label,
    type: 'link',
  } satisfies StarlightRouteData['sidebar'][number]
}

function makeSidebarGroup(label: string, entries: StarlightRouteData['sidebar']) {
  return {
    badge: undefined,
    collapsed: false,
    entries,
    label,
    type: 'group',
  } satisfies StarlightRouteData['sidebar'][number]
}

function getBlogDataPerLocale(config: StarlightBlogConfig, locale: Locale) {
  return blogsDataPerLocale.get(config.prefix)?.get(locale)
}

function setBlogDataPerLocale(config: StarlightBlogConfig, locale: Locale, data: StarlightBlogData) {
  const localeCache = blogsDataPerLocale.get(config.prefix) ?? new Map<Locale, StarlightBlogData>()

  localeCache.set(locale, data)
  blogsDataPerLocale.set(config.prefix, localeCache)
}
