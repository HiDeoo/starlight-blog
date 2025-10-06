import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext, AstroBuiltinAttributes } from 'astro'
import type { HTMLAttributes } from 'astro/types'
import config from 'virtual:starlight-blog-config'

import type { StarlightBlogData } from './data'
import { getAllAuthors, getEntryAuthors } from './libs/authors'
import { renderBlogEntryToString } from './libs/container'
import { getBlogEntries, getSidebarBlogEntries } from './libs/content'
import type { Locale } from './libs/i18n'
import { getMetrics } from './libs/metrics'
import { isNavigationWithSidebarLink } from './libs/navigation'
import {
  getPathWithLocale,
  getRelativeBlogUrl,
  getRelativeUrl,
  getSidebarProps,
  isAnyBlogPage,
  isBlogAuthorPage,
  isBlogRoot,
  isBlogTagPage,
} from './libs/page'
import { getAllTags, getEntryTags } from './libs/tags'
import { getBlogTitle } from './libs/title'

const blogDataPerLocale = new Map<Locale, StarlightBlogData>()

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals
  const { id, locale } = starlightRoute

  context.locals.starlightBlog = await getBlogData(starlightRoute, context.locals.t)

  const isBlog = isAnyBlogPage(id)

  if (!isBlog) {
    if (isNavigationWithSidebarLink(config)) {
      starlightRoute.sidebar.unshift(
        makeSidebarLink(getBlogTitle(locale), getRelativeBlogUrl('/', locale), false, { class: 'sl-blog-mobile-link' }),
      )
    }
    return
  }

  starlightRoute.sidebar = await getBlogSidebar(context)
})

export async function getBlogData({ locale }: StarlightRouteData, t: App.Locals['t']): Promise<StarlightBlogData> {
  if (blogDataPerLocale.has(locale)) {
    return blogDataPerLocale.get(locale) as StarlightBlogData
  }

  const posts = await getBlogPostsData(locale, t)

  const authors = new Map<string, StarlightBlogData['authors'][number]>()

  for (const post of posts) {
    for (const author of post.authors) {
      if (authors.has(author.name)) continue
      authors.set(author.name, author)
    }
  }

  const blogData: StarlightBlogData = { posts, authors: [...authors.values()] }

  blogDataPerLocale.set(locale, blogData)

  return blogData
}

async function getBlogPostsData(locale: Locale, t: App.Locals['t']): Promise<StarlightBlogData['posts']> {
  const entries = await getBlogEntries(locale)

  return Promise.all(
    entries.map(async (entry) => {
      const authors = getEntryAuthors(entry)
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
          href: getRelativeBlogUrl(`/tags/${slug}`, locale),
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

async function getBlogSidebar(context: APIContext): Promise<StarlightRouteData['sidebar']> {
  const { starlightRoute, t } = context.locals
  const { id, locale } = starlightRoute

  const { featured, recent } = await getSidebarBlogEntries(locale)

  const sidebar: StarlightRouteData['sidebar'] = [
    makeSidebarLink(t('starlightBlog.sidebar.all'), getRelativeBlogUrl('/', locale), isBlogRoot(id)),
  ]

  if (featured.length > 0) {
    sidebar.push(makeSidebarGroup(t('starlightBlog.sidebar.featured'), getSidebarProps(id, featured, locale)))
  }

  sidebar.push(makeSidebarGroup(t('starlightBlog.sidebar.recent'), getSidebarProps(id, recent, locale)))

  const tags = await getAllTags(locale)

  if (tags.size > 0) {
    sidebar.push(
      makeSidebarGroup(
        t('starlightBlog.sidebar.tags'),
        [...tags]
          .sort(([, a], [, b]) => {
            if (a.entries.length === b.entries.length) {
              return a.label.localeCompare(b.label)
            }

            return b.entries.length - a.entries.length
          })
          .map(([tagSlug, { entries, label }]) =>
            makeSidebarLink(
              `${label} (${entries.length})`,
              getRelativeBlogUrl(`/tags/${tagSlug}`, locale),
              isBlogTagPage(id, tagSlug),
            ),
          ),
      ),
    )
  }

  const authors = await getAllAuthors(locale)

  if (authors.size > 1) {
    sidebar.push(
      makeSidebarGroup(
        t('starlightBlog.sidebar.authors'),
        [...authors]
          .sort(([, a], [, b]) => {
            if (a.entries.length === b.entries.length) {
              return a.author.name.localeCompare(b.author.name)
            }

            return b.entries.length - a.entries.length
          })
          .map(([, { author, entries }]) =>
            makeSidebarLink(
              `${author.name} (${entries.length})`,
              getRelativeBlogUrl(`/authors/${author.slug}`, locale),
              isBlogAuthorPage(id, author.slug),
            ),
          ),
      ),
    )
  }

  if (context.site) {
    sidebar.push(makeSidebarLink(t('starlightBlog.sidebar.rss'), getRelativeBlogUrl('/rss.xml', locale, true), false))
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
