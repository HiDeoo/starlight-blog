import { getCollection } from 'astro:content'

import type { StarlightBlogEntry } from './schema'

export async function getBlogEntries() {
  const starlightBlogEntries = await getCollection<StarlightBlogEntry>('docs', ({ id }) => {
    return id.startsWith('blog/')
  })

  return starlightBlogEntries
}
