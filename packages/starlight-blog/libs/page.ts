import type { AstroGlobal } from 'astro'
import config from 'virtual:starlight-blog-config'

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

export function getPageProps(title: string) {
  return {
    entry: {
      data: {
        editUrl: false,
        head: [],
        tableOfContents: false,
        title,
      },
    },
    entryMeta: {
      lang: config.locale,
    },
    lang: config.locale,
  }
}
