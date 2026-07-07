import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import type { APIContext } from 'astro'
import { z } from 'astro/zod'
import { slug } from 'github-slugger'
import { vi } from 'vitest'

import type { StarlightBlogData } from '../../data'
import type { StarlightBlogEntry } from '../../libs/content'
import { blogEntrySchema } from '../../schema'

export async function mockBlogPosts(posts: MockBlogPost[]) {
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

export function getStructuredDataScripts(context: APIContext) {
  return context.locals.starlightRoute.head.filter(
    (entry) => entry.tag === 'script' && entry.attrs?.['type'] === 'application/ld+json',
  )
}

export function getStructuredDataNodes(
  scripts: ReturnType<typeof getStructuredDataScripts>,
): Record<string, unknown>[] {
  return scripts.flatMap((entry) => {
    const content = JSON.parse(entry.content ?? '{}') as Record<string, unknown>
    return Array.isArray(content['@graph']) ? (content['@graph'] as Record<string, unknown>[]) : [content]
  })
}

export function getStructuredDataNode(nodes: Record<string, unknown>[], type: string) {
  return nodes.find((node) => node['@type'] === type)
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
    entryMetaLang?: string
    id?: string
    isFallback?: boolean
    lang?: string
    locale?: StarlightRouteData['locale']
    site?: URL | false
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
        lang: options?.lang ?? 'en',
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

export type MockBlogPost = Parameters<typeof mockBlogPost>
