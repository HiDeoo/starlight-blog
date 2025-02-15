import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext, AstroBuiltinAttributes } from 'astro'
import type { HTMLAttributes } from 'astro/types'

import { getAllAuthors } from './libs/authors'
import { getSidebarBlogEntries } from './libs/content'
import {
  getRelativeBlogUrl,
  getSidebarProps,
  isAnyBlogAuthorPage,
  isAnyBlogPostPage,
  isAnyBlogTagPage,
  isBlogAuthorPage,
  isBlogRoot,
  isBlogTagPage,
} from './libs/page'
import { getAllTags } from './libs/tags'
import { getBlogTitle } from './libs/title'

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals
  const { locale } = starlightRoute

  // TODO(HiDeoo) test accessing this in a Starlight route
  // TODO(HiDeoo) test accessing this in a custom Starlight route
  // TODO(HiDeoo) test accessing this in a custom non-Starlight route
  context.locals.starlightBlog = getRouteData(starlightRoute)

  const isBlog = context.locals.starlightBlog.page !== undefined

  if (!isBlog) {
    starlightRoute.sidebar.unshift(
      makeSidebarLink(getBlogTitle(locale), getRelativeBlogUrl('/', locale), false, { class: 'sl-blog-mobile-link' }),
    )
    return
  }

  starlightRoute.sidebar = await getBlogSidebar(context)
})

function getRouteData({ id }: StarlightRouteData): StarlightBlogRouteData {
  return {
    page: isBlogRoot(id)
      ? { type: 'root' }
      : isAnyBlogPostPage(id)
        ? { type: 'post' }
        : isAnyBlogTagPage(id)
          ? { type: 'tag' }
          : isAnyBlogAuthorPage(id)
            ? { type: 'author' }
            : undefined,
  }
}

async function getBlogSidebar(context: APIContext): Promise<StarlightRouteData['sidebar']> {
  const { starlightRoute, starlightBlog, t } = context.locals
  const { id, locale } = starlightRoute
  const { page } = starlightBlog

  const { featured, recent } = await getSidebarBlogEntries(locale)

  const sidebar: StarlightRouteData['sidebar'] = [
    makeSidebarLink(t('starlightBlog.sidebar.all'), getRelativeBlogUrl('/', locale), page?.type === 'root'),
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

// TODO(HiDeoo) Where to export this from
export interface StarlightBlogRouteData {
  page:
    | {
        type: 'root' | 'post' | 'tag' | 'author'
      }
    | undefined
}
