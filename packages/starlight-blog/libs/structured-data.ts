import type { APIContext } from 'astro'
import type { Blog, BlogPosting, BreadcrumbList, ListItem, Person, Thing, WithContext } from 'schema-dts'

import type { StarlightBlogData } from '../data'

import type { StarlightBlogEntry } from './content'
import { stripMarkdown } from './markdown'
import { getRelativeBlogUrl, isAnyBlogPostPage } from './page'
import { getBlogTitle } from './title'

// TODO(HiDeoo) validation tool

export async function addStructuredData(context: APIContext) {
  if (!isAPIContextWithSite(context)) return

  const { starlightRoute } = context.locals

  if (!isAnyBlogPostPage(starlightRoute.id)) return

  await addBlogPostStructuredData(context)
}

async function addBlogPostStructuredData(context: APIContextWithSite) {
  const { locals, site } = context
  const { starlightBlog, starlightRoute } = locals
  const { entry, entryMeta } = starlightRoute

  const post = starlightBlog.posts.find((post) => post.entry.id === entry.id)
  if (!post) return

  const blog = getStructuredDataBlog(context)
  const postUrl = new URL(post.href, site).href
  const image = getStructuredDataImage(post.cover, site)
  const description = await getStructuredDataDescription(post.entry)

  const blogPosting: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
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

  addStructuredDataScript(context, blogPosting)

  const breadcrumbList: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      getStructuredDataListItem(1, getBlogTitle(starlightRoute.locale), blog.url),
      getStructuredDataListItem(2, post.title),
    ],
  }

  addStructuredDataScript(context, breadcrumbList)
}

function addStructuredDataScript(context: APIContextWithSite, structuredData: WithContext<Thing>) {
  context.locals.starlightRoute.head.push({
    attrs: { type: 'application/ld+json' },
    content: JSON.stringify(structuredData),
    tag: 'script',
  })
}

function getStructuredDataBlog(context: APIContextWithSite) {
  const {
    locals: { starlightRoute },
    site,
  } = context

  return {
    '@type': 'Blog',
    name: getBlogTitle(starlightRoute.locale),
    url: new URL(getRelativeBlogUrl('/', starlightRoute.locale), site).href,
  } satisfies Blog
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

function getStructuredDataListItem(position: number, name: string, item?: string) {
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

function isAPIContextWithSite(context: APIContext): context is APIContextWithSite {
  return context.site !== undefined
}

type APIContextWithSite = APIContext & { site: URL }
