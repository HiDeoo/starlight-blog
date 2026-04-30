import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext } from 'astro'
import { z } from 'astro/zod'
import { slug } from 'github-slugger'
import { vi } from 'vitest'

import type { StarlightBlogData } from '../../data'
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

export async function getTestBlogData(options?: {
  getter?: typeof import('../../middleware').getBlogData
  locale?: StarlightRouteData['locale']
}) {
  let getBlogData = options?.getter

  if (!getBlogData) {
    const mod = await import('../../middleware')
    getBlogData = mod.getBlogData
  }

  return getBlogData({ locale: options?.locale ?? 'en' } as StarlightRouteData, (() => '') as App.Locals['t'])
}

export function mockCoverImage(src = 'test.webp') {
  return {
    format: 'webp' as const,
    height: 100,
    src,
    width: 100,
  }
}

export function getTestContext(
  starlightBlog: StarlightBlogData,
  post: StarlightBlogData['posts'][number] | undefined,
  options?: {
    id?: string
    site?: URL | false
    locale?: StarlightRouteData['locale']
    entryMetaLang?: string
    isFallback?: boolean
  },
) {
  return {
    locals: {
      starlightBlog,
      starlightRoute: {
        entry: post?.entry,
        entryMeta: { dir: 'ltr', lang: options?.entryMetaLang ?? 'en' },
        head: [],
        id: options?.id ?? post?.entry.id,
        isFallback: options?.isFallback,
        locale: options?.locale ?? 'en',
      },
    },
    site: options?.site === false ? undefined : new URL('https://example.com'),
  } as unknown as APIContext
}

function mockBlogPost(docsFilePath: string, entry: StarlightBlogEntryData): StarlightBlogEntry {
  return {
    id: `blog/${slug(docsFilePath.replace(/\.[^.]+$/, '').replace(/\/index$/, ''))}`,
    collection: 'docs',
    data: z
      .looseObject(
        blogEntrySchema({
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
        }).shape,
      )
      .parse(entry) as StarlightBlogEntry['data'],
    filePath: `src/content/docs/blog/${docsFilePath}`,
    body: '',
  }
}

type StarlightBlogEntryData = z.input<ReturnType<typeof blogEntrySchema>> & {
  title: string
  description?: string
  lastUpdated?: Date | boolean
}
