import { getCollection } from 'astro:content'

import type { StarlightBlogEntry } from './schema'

export async function getBlogStaticPaths() {
  // TODO(HiDeoo) order
  await getBlogEntries()

  // TODO(HiDeoo) validation

  // TODO(HiDeoo) pass down entries to each pages
  // TODO(HiDeoo) Handle no blog post
  return [
    {
      params: {
        page: undefined,
      },
    },
    {
      params: {
        page: '1',
      },
    },
  ]
}

// TODO(HiDeoo) order
// TODO(HiDeoo) limit
export async function getRecentBlogEntries() {
  return getBlogEntries()
}

function getBlogEntries() {
  // TODO(HiDeoo) order
  return getCollection<StarlightBlogEntry>('docs', ({ id }) => {
    return id.startsWith('blog/') && id !== 'blog/index.mdx'
  })
}
