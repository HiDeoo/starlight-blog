import type { AstroGlobal } from 'astro'

export function isAnyBlogPage({ url }: AstroGlobal) {
  return url.pathname.match(/^\/blog(\/?$|\/.+\/?$)/)
}

export function isBlogRoot({ url }: AstroGlobal) {
  return url.pathname.match(/^\/blog\/?$/)
}

export function isAnyBlogPostPage({ url }: AstroGlobal) {
  return url.pathname.match(/^\/blog\/(?!(\d+\/?|tags\/.+)$).+$/) !== null
}

export function isBlogPostPage({ url }: AstroGlobal, slug: string) {
  return url.pathname.match(new RegExp(`^/${slug}/?$`)) !== null
}

export function isBlogTagsPage({ url }: AstroGlobal, tag: string) {
  return url.pathname.match(new RegExp(`^/blog/tags/${tag}/?$`)) !== null
}
