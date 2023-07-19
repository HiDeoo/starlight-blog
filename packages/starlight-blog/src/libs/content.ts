import type { docsSchema } from '@astrojs/starlight/schema'
import type { z } from 'astro/zod'
import { getCollection } from 'astro:content'

export async function getBlogEntries() {
  const starlightBlogEntries = await getCollection<StarlightEntryData>('docs', ({ id }) => {
    return id.startsWith('blog/')
  })

  // TODO(HiDeoo) validation

  return starlightBlogEntries
}

type StarlightEntryData = z.infer<ReturnType<ReturnType<typeof docsSchema>>>
