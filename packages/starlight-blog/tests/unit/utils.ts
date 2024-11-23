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

function mockBlogPost(id: string, entry: StarlightBlogEntryData): StarlightBlogEntry {
  return {
    id: `blog/${id}`,
    slug: `blog/${slug(id.replace(/\.[^.]+$/, '').replace(/\/index$/, ''))}`,
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
      .parse(entry) as StarlightBlogEntryData,
    body: '',
    render: (() => {
      // We do not care about the render function in the unit tests.
      return {
        Content: () => undefined,
      }
    }) as unknown as StarlightBlogEntry['render'],
  }
}

type StarlightBlogEntryData = z.input<ReturnType<typeof blogEntrySchema>> & { title: string }
