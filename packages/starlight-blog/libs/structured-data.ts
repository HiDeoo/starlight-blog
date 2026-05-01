import type { APIContext } from 'astro'
import type { Blog, BlogPosting, BreadcrumbList, CollectionPage, ItemList, ListItem, Person } from 'schema-dts'
import config from 'virtual:starlight-blog/config'

import type { StarlightBlogData } from '../data'

import type { StarlightBlogEntry } from './content'
import { stripMarkdown } from './markdown'
import { getRelativeBlogUrl, isAnyBlogPostPage, isBlogPaginationPage, isBlogRoot } from './page'
import { getBlogTitle } from './title'

// TODO(HiDeoo) validation tool

export async function addStructuredData(context: APIContext) {
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

  if (!isAnyBlogPostPage(starlightRoute.id)) return

  await addBlogPostStructuredData(context)
}

function addBlogRootStructuredData(context: APIContextWithSite) {
  addBlogArchiveStructuredData(context, {
    currentPath: '/',
    posts: context.locals.starlightBlog.posts.slice(0, config.postCount),
    relation: 'mainEntity',
  })
}

function addBlogPaginationStructuredData(context: APIContextWithSite) {
  const pageNumber = getStructuredDataPaginationPageNumber(context.locals.starlightRoute.id)
  const start = (pageNumber - 1) * config.postCount
  const end = start + config.postCount

  addBlogArchiveStructuredData(context, {
    currentPath: `/${pageNumber}`,
    posts: context.locals.starlightBlog.posts.slice(start, end),
    relation: 'isPartOf',
  })
}

function addBlogArchiveStructuredData(
  context: APIContextWithSite,
  options: {
    currentPath: string
    relation: 'isPartOf' | 'mainEntity'
    posts: StarlightBlogData['posts']
  },
) {
  const {
    locals: { starlightBlog, starlightRoute },
    site,
  } = context

  const blogMetadata = getStructuredDataBlogMetadata(context)
  const pageMetadata = getStructuredDataPageMetadata(context, options.currentPath)
  const blog = getStructuredDataBlog(blogMetadata)

  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    hasPart: { '@id': pageMetadata.posts.id },
    inLanguage: starlightRoute.lang,
    name: blogMetadata.title,
    url: pageMetadata.url,
    ...(options.relation === 'mainEntity'
      ? { mainEntity: { '@id': blogMetadata.id } }
      : { isPartOf: { '@id': blogMetadata.id } }),
  }

  const itemList = getStructuredDataItemList(pageMetadata.posts.id, options.posts, starlightBlog.posts, site)

  addStructuredDataScript(context, [collectionPage, blog, itemList])
}

async function addBlogPostStructuredData(context: APIContextWithSite) {
  const { locals, site } = context
  const { starlightBlog, starlightRoute } = locals
  const { entry, entryMeta } = starlightRoute

  const post = starlightBlog.posts.find((post) => post.entry.id === entry.id)
  if (!post) return

  const blogMetadata = getStructuredDataBlogMetadata(context)
  const blog = getStructuredDataBlog(blogMetadata)
  const postUrl = new URL(post.href, site).href
  const image = getStructuredDataImage(post.cover, site)
  const description = await getStructuredDataDescription(post.entry)

  const blogPosting: BlogPosting = {
    '@type': 'BlogPosting',
    datePublished: post.createdAt.toISOString(),
    headline: post.title,
    inLanguage: entryMeta.lang,
    isPartOf: blog,
    mainEntityOfPage: postUrl,
    url: postUrl,
  }

  if (post.authors.length > 0) blogPosting.author = post.authors.map(getStructureDataAuthor)
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

async function getStructuredDataDescription(entry: StarlightBlogEntry) {
  if (entry.data.description) return entry.data.description

  if (entry.data.excerpt) {
    const description = await stripMarkdown(entry.data.excerpt)
    if (description.length > 0) return description
  }

  return
}

function getStructureDataAuthor(author: StarlightBlogData['authors'][number]) {
  const person: Person = { '@type': 'Person', name: author.name }

  if (author.url) person.url = author.url

  return person
}

function getStructuredDataItemList(
  id: string,
  visiblePosts: StarlightBlogData['posts'],
  allPosts: StarlightBlogData['posts'],
  site: URL,
): ItemList {
  return {
    '@id': id,
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: visiblePosts.map((post, index) => getStructuredDataPostListItem(index + 1, post, site)),
    numberOfItems: allPosts.length,
  }
}

function getStructuredDataPostListItem(
  position: number,
  post: StarlightBlogData['posts'][number],
  site: URL,
): ListItem {
  const postUrl = new URL(post.href, site).href

  return {
    '@type': 'ListItem',
    position,
    item: { '@type': 'BlogPosting', headline: post.title, url: postUrl },
  }
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

  const url = new URL(getRelativeBlogUrl(currentPath, starlightRoute.locale), site).href

  return { url, posts: { id: `${url}#posts` } }
}

function getStructuredDataPaginationPageNumber(slug: string) {
  return Number.parseInt(slug.split('/').at(-1) ?? '', 10)
}

function isAPIContextWithSite(context: APIContext): context is APIContextWithSite {
  return context.site !== undefined
}

type APIContextWithSite = APIContext & { site: URL }

interface StructuredDataBlogMetadata {
  id: string
  title: string
  url: string
}

interface StructuredDataPageMetadata {
  url: string
  posts: {
    id: string
  }
}

// We avoid importing `Thing` from `schema-dts` as it seems that the large union is causing some type inference
// performance issues.
export type Thing = Blog | BlogPosting | BreadcrumbList | CollectionPage | ItemList | ListItem | Person

interface Graph {
  '@context': 'https://schema.org'
  '@graph': Thing[]
}

type WithContext<T extends Thing> = T & {
  '@context': 'https://schema.org'
}
