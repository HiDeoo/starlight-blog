import type { APIContext } from 'astro'
import type { Blog, BlogPosting, BreadcrumbList, CollectionPage, DefinedTerm, ListItem, Person } from 'schema-dts'

import type { StarlightBlogData } from '../data'

import { getAuthorSlug } from './authors'
import type { StarlightBlogEntry } from './content'
import type { Locale } from './i18n'
import { stripMarkdown } from './markdown'
import {
  getRelativeBlogUrl,
  isAnyBlogAuthorPage,
  isAnyBlogPostPage,
  isAnyBlogTagPage,
  isBlogPaginationPage,
  isBlogRoot,
} from './page'
import { getBlogTitle } from './title'

export function addStructuredData(context: APIContext) {
  if (!isAPIContextWithSite(context)) return

  const { starlightRoute } = context.locals

  if (isBlogRoot(starlightRoute.id)) {
    addBlogRootStructuredData(context)
    return
  }

  if (isBlogPaginationPage(starlightRoute.id)) {
    addBlogPaginationStructuredData(context)
    return
  }

  if (isAnyBlogTagPage(starlightRoute.id)) {
    addBlogTagStructuredData(context)
    return
  }

  if (isAnyBlogAuthorPage(starlightRoute.id)) {
    addBlogAuthorStructuredData(context)
    return
  }

  if (!isAnyBlogPostPage(starlightRoute.id)) return

  addBlogPostStructuredData(context)
}

function addBlogRootStructuredData(context: APIContextWithSite) {
  addBlogCollectionStructuredData(context, {
    blogRelation: 'mainEntity',
    pageMetadata: getStructuredDataPageMetadata(context, '/'),
  })
}

function addBlogPaginationStructuredData(context: APIContextWithSite) {
  const pageNumber = getStructuredDataPaginationPageNumber(context.locals.starlightRoute.id)

  addBlogCollectionStructuredData(context, {
    blogRelation: 'isPartOf',
    pageMetadata: getStructuredDataPageMetadata(context, `/${pageNumber}`),
  })
}

function addBlogTagStructuredData(context: APIContextWithSite) {
  const tagPage = getStructuredDataTagPage(context)
  if (!tagPage) return

  const pageMetadata = getStructuredDataPageMetadata(context, `/tags/${tagPage.slug}`)
  const tagId = getStructuredDataPageEntityId(pageMetadata, 'tag')
  const tag = getStructuredDataTag(pageMetadata, tagPage.label)

  addBlogCollectionStructuredData(context, {
    blogRelation: 'isPartOf',
    mainEntityId: tagId,
    name: tagPage.label,
    pageMetadata,
    things: [tag],
  })
}

function addBlogAuthorStructuredData(context: APIContextWithSite) {
  const authorPage = getStructuredDataAuthorPage(context)
  if (!authorPage) return

  const pageMetadata = getStructuredDataPageMetadata(context, `/authors/${authorPage.slug}`)
  const authorId = getStructuredDataAuthorId(authorPage.author, context.locals.starlightRoute.locale, context.site)
  const author = getStructuredDataAuthor(authorPage.author, authorId)

  addBlogCollectionStructuredData(context, {
    blogRelation: 'isPartOf',
    mainEntityId: authorId,
    name: authorPage.author.name,
    pageMetadata,
    things: [author],
  })
}

function addBlogCollectionStructuredData(
  context: APIContextWithSite,
  options: {
    blogRelation: 'isPartOf' | 'mainEntity'
    mainEntityId?: string
    name?: string
    pageMetadata: StructuredDataPageMetadata
    things?: Thing[]
  },
) {
  const {
    locals: { starlightRoute },
  } = context

  const blogMetadata = getStructuredDataBlogMetadata(context)
  const blog = getStructuredDataBlog(blogMetadata)

  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    inLanguage: starlightRoute.lang,
    name: options.name ?? blogMetadata.title,
    url: options.pageMetadata.url,
    ...(options.blogRelation === 'mainEntity'
      ? { mainEntity: { '@id': blogMetadata.id } }
      : { isPartOf: { '@id': blogMetadata.id } }),
  }

  if (options.mainEntityId) collectionPage.mainEntity = { '@id': options.mainEntityId }

  addStructuredDataScript(context, [collectionPage, blog, ...(options.things ?? [])])
}

function addBlogPostStructuredData(context: APIContextWithSite) {
  const { locals, site } = context
  const { starlightBlog, starlightRoute } = locals
  const { entry, entryMeta } = starlightRoute

  const post = starlightBlog.posts.find((post) => post.entry.id === entry.id)
  if (!post) return

  const blogMetadata = getStructuredDataBlogMetadata(context)
  const blog = getStructuredDataBlog(blogMetadata)
  const postUrl = new URL(post.href, site).href
  const image = getStructuredDataImage(post.cover, site)
  const description = getStructuredDataDescription(post.entry)

  const blogPosting: BlogPosting = {
    '@type': 'BlogPosting',
    datePublished: post.createdAt.toISOString(),
    headline: post.title,
    inLanguage: entryMeta.lang,
    isPartOf: blog,
    mainEntityOfPage: postUrl,
    url: postUrl,
  }

  if (post.authors.length > 0) {
    blogPosting.author = post.authors.map((author) =>
      getStructuredDataAuthor(author, getStructuredDataAuthorId(author, starlightRoute.locale, site)),
    )
  }
  if (post.updatedAt) blogPosting.dateModified = post.updatedAt.toISOString()
  if (description) blogPosting.description = description
  if (image) blogPosting.image = image
  if (post.tags.length > 0) blogPosting.keywords = post.tags.map((tag) => tag.label)

  const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      getStructuredDataBreadcrumbListItem(1, blogMetadata.title, blogMetadata.url),
      getStructuredDataBreadcrumbListItem(2, post.title),
    ],
  }

  addStructuredDataScript(context, [blogPosting, breadcrumbList])
}

function addStructuredDataScript(context: APIContextWithSite, things: [Exclude<Thing, string>, ...Thing[]]) {
  const content =
    things.length === 1
      ? ({
          '@context': 'https://schema.org',
          ...things[0],
        } satisfies WithContext<Thing>)
      : ({
          '@context': 'https://schema.org',
          '@graph': things,
        } satisfies Graph)

  context.locals.starlightRoute.head.push({
    attrs: { type: 'application/ld+json' },
    content: JSON.stringify(content),
    tag: 'script',
  })
}

function getStructuredDataBlog(blogMetadata: StructuredDataBlogMetadata): Blog {
  return { '@id': blogMetadata.id, '@type': 'Blog', name: blogMetadata.title, url: blogMetadata.url }
}

function getStructuredDataDescription(entry: StarlightBlogEntry) {
  if (entry.data.description) return entry.data.description

  if (entry.data.excerpt) {
    const description = stripMarkdown(entry.data.excerpt)
    if (description.length > 0) return description
  }

  return
}

function getStructuredDataAuthor(author: StarlightBlogData['authors'][number], id?: string) {
  const person: Person = { '@type': 'Person', ...(id ? { '@id': id } : {}), name: author.name }

  if (author.url) person.url = author.url

  return person
}

function getStructuredDataBreadcrumbListItem(position: number, name: string, item?: string) {
  const listItem: ListItem = { '@type': 'ListItem', position, name }

  if (item) listItem.item = item

  return listItem
}

function getStructuredDataImage(cover: StarlightBlogData['posts'][number]['cover'], site: URL) {
  if (!cover) return

  if ('image' in cover) return getStructuredDataUrl(cover.image, site)

  return getStructuredDataUrl(cover.light, site)
}

function getStructuredDataUrl(image: string | { src: string }, site: URL) {
  return new URL(typeof image === 'string' ? image : image.src, site).href
}

function getStructuredDataTagPage(context: APIContextWithSite) {
  const page = getStructuredDataFilteredPage(context, (post, slug, locale) => {
    const href = getRelativeBlogUrl(`/tags/${slug}`, locale)
    return post.tags.find((tag) => tag.href === href)?.label
  })

  if (!page) return

  return { label: page.match, posts: page.posts, slug: page.slug }
}

function getStructuredDataAuthorPage(context: APIContextWithSite) {
  const page = getStructuredDataFilteredPage(context, (post, slug) =>
    post.authors.find((author) => getAuthorSlug(author.name) === slug),
  )

  if (!page) return

  return { author: page.match, posts: page.posts, slug: page.slug }
}

function getStructuredDataFilteredPage<T>(
  context: APIContextWithSite,
  getMatch: (post: StarlightBlogData['posts'][number], slug: string, locale: Locale) => T | undefined,
) {
  const {
    locals: { starlightBlog, starlightRoute },
  } = context

  const slug = starlightRoute.id.split('/').at(-1)
  if (!slug) return

  const posts: StarlightBlogData['posts'] = []
  let match: T | undefined

  for (const post of starlightBlog.posts) {
    const currentMatch = getMatch(post, slug, starlightRoute.locale)
    if (!currentMatch) continue

    posts.push(post)
    match ??= currentMatch
  }

  if (!match) return

  return { match, posts, slug }
}

function getStructuredDataTag(pageMetadata: StructuredDataPageMetadata, label: string): DefinedTerm {
  return {
    '@id': getStructuredDataPageEntityId(pageMetadata, 'tag'),
    '@type': 'DefinedTerm',
    name: label,
    url: pageMetadata.url,
  }
}

function getStructuredDataBlogMetadata(context: APIContextWithSite): StructuredDataBlogMetadata {
  const {
    locals: { starlightRoute },
    site,
  } = context

  const title = getBlogTitle(starlightRoute.locale)
  const url = new URL(getRelativeBlogUrl('/', starlightRoute.locale), site).href

  return { id: `${url}#blog`, title, url }
}

function getStructuredDataPageMetadata(context: APIContextWithSite, currentPath: string): StructuredDataPageMetadata {
  const {
    locals: { starlightRoute },
    site,
  } = context

  return { url: new URL(getRelativeBlogUrl(currentPath, starlightRoute.locale), site).href }
}

function getStructuredDataPageEntityId(metadata: StructuredDataPageMetadata, entity: StructuredDataPageEntity) {
  return `${metadata.url}#${entity}`
}

function getStructuredDataAuthorId(author: StarlightBlogData['authors'][number], locale: Locale, site: URL) {
  const url = new URL(getRelativeBlogUrl(`/authors/${getAuthorSlug(author.name)}`, locale), site).href
  return `${url}#author`
}

function getStructuredDataPaginationPageNumber(slug: string) {
  return Number.parseInt(slug.split('/').at(-1) ?? '', 10)
}

function isAPIContextWithSite(context: APIContext): context is APIContextWithSite {
  return context.site !== undefined
}

type APIContextWithSite = APIContext & { site: URL }

type StructuredDataPageEntity = 'author' | 'tag'

interface StructuredDataPageMetadata {
  url: string
}

interface StructuredDataBlogMetadata extends StructuredDataPageMetadata {
  id: string
  title: string
}

// We avoid importing `Thing` from `schema-dts` as it seems that the large union is causing some type inference
// performance issues.
export type Thing = Blog | BlogPosting | BreadcrumbList | CollectionPage | DefinedTerm | ListItem | Person

interface Graph {
  '@context': 'https://schema.org'
  '@graph': Thing[]
}

type WithContext<T extends Thing> = T & {
  '@context': 'https://schema.org'
}
