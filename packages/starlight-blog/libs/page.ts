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

interface StarlightPageProps {
  frontmatter: {
    title: string
  }
}
