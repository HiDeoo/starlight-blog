import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext, AstroBuiltinAttributes } from 'astro'
import type { HTMLAttributes } from 'astro/types'

import { getAllAuthors } from './libs/authors'
import { getBlogEntries, getBlogEntryMetadata, getSidebarBlogEntries } from './libs/content'
import type { Locale } from './libs/i18n'
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
import type { StarlightBlogRouteData } from './route-data'

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals
  const { id, locale } = starlightRoute

  context.locals.starlightBlog = await getRouteData(starlightRoute)

  const isBlog = isAnyBlogPage(id)

  if (!isBlog) {
    starlightRoute.sidebar.unshift(
      makeSidebarLink(getBlogTitle(locale), getRelativeBlogUrl('/', locale), false, { class: 'sl-blog-mobile-link' }),
    )
    return
  }

  starlightRoute.sidebar = await getBlogSidebar(context)
})

export async function getRouteData({ locale }: StarlightRouteData): Promise<StarlightBlogRouteData> {
  return {
    posts: await getPostsRouteData(locale),
  }
}

async function getPostsRouteData(locale: Locale): Promise<StarlightBlogRouteData['posts']> {
  const entries = await getBlogEntries(locale)

  return entries.map((entry) => {
    const { authors } = getBlogEntryMetadata(entry, locale)
    const tags = getEntryTags(entry)

    const postRouteData: StarlightBlogRouteData['posts'][number] = {
      authors: authors.map(({ name, title, url }) => ({
        name,
        title,
        url,
      })),
      createdAt: entry.data.date,
      draft: entry.data.draft,
      featured: entry.data.featured === true,
      href: getRelativeUrl(`/${getPathWithLocale(entry.id, locale)}`),
      tags: tags.map(({ label, slug }) => ({
        label,
        href: getRelativeBlogUrl(`/tags/${slug}`, locale),
      })),
      title: entry.data.title,
    }

    if (entry.data.lastUpdated && typeof entry.data.lastUpdated !== 'boolean') {
      postRouteData.updatedAt = entry.data.lastUpdated
    }

    return postRouteData
  })
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
