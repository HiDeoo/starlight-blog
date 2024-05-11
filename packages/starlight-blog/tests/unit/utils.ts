import type { z } from 'astro/zod'
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
    data: blogEntrySchema.passthrough().parse(entry) as StarlightBlogEntryData,
    body: '',
    render: (() => {
      // We do not care about the render function in the unit tests.
    }) as StarlightBlogEntry['render'],
  }
}

type StarlightBlogEntryData = z.input<typeof blogEntrySchema> & { title: string }
