import { z } from 'astro/zod'
import { slug } from 'github-slugger'
import { vi } from 'vitest'

import type { StarlightBlogEntry } from '../../libs/content'
import { blogEntrySchema } from '../../schema'

export async function mockBlogPosts(posts: Parameters<typeof mockBlogPost>[]) {
  const mod = await vi.importActual<typeof import('astro:content')>('astro:content')
  const mockPosts = posts.map((post) => mockBlogPost(...post))

  return {
    ...mod,
    getCollection: () => mockPosts,
  }
}

export function mockBlogPost(docsFilePath: string, entry: StarlightBlogEntryData): StarlightBlogEntry {
  return {
    id: `blog/${slug(docsFilePath.replace(/\.[^.]+$/, '').replace(/\/index$/, ''))}`,
    collection: 'docs',
    data: blogEntrySchema({
      image: () =>
        z.object({
          src: z.string(),
          width: z.number(),
          height: z.number(),
          format: z.union([
            z.literal('png'),
            z.literal('jpg'),
            z.literal('jpeg'),
            z.literal('tiff'),
            z.literal('webp'),
            z.literal('gif'),
            z.literal('svg'),
            z.literal('avif'),
          ]),
        }),
    })
      .passthrough()
      .parse(entry) as StarlightBlogEntry['data'],
    filePath: `src/content/docs/blog/${docsFilePath}`,
    body: '',
  }
}

type StarlightBlogEntryData = z.input<ReturnType<typeof blogEntrySchema>> & { title: string }
