import type { AstroConfig } from 'astro'
import context from 'virtual:starlight-blog-context'

const trailingSlashTransformers: Record<AstroConfig['trailingSlash'], (path: string) => string> = {
  always: ensureTrailingSlash,
  ignore: (href) => href,
  never: stripTrailingSlash,
}

const base = stripTrailingSlash(import.meta.env.BASE_URL)

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
  return slug.match(/^blog(\/?$|\/.+\/?$)/) !== null
}

export function isBlogRoot(slug: string) {
  return slug === 'blog'
}

export function isAnyBlogPostPage(slug: string) {
  return slug.match(/^blog\/(?!(\d+\/?|tags\/.+)$).+$/) !== null
}

export function isBlogPostPage(slug: string, postSlug: string) {
  return slug === postSlug
}

export function isBlogTagsPage(slug: string, tag: string) {
  return slug === `blog/tags/${tag}`
}

export function getPageProps(title: string): StarlightPageProps {
  return {
    frontmatter: {
      title,
    },
  }
}

function stripLeadingSlash(path: string) {
  if (!path.startsWith('/')) {
    return path
  }

  return path.slice(1)
}

function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    return path
  }

  return path.slice(0, -1)
}

function ensureTrailingSlash(path: string): string {
  if (path.endsWith('/')) {
    return path
  }

  return `${path}/`
}

interface StarlightPageProps {
  frontmatter: {
    title: string
  }
}
