import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export function blogSchema(context: SchemaContext) {
  return docsSchema()(context).extend({
    // TODO(HiDeoo)
    tags: z.string().array().optional(),
  })
}

export type StarlightBlogEntry = z.infer<ReturnType<typeof blogSchema>>

type SchemaContext = Parameters<ReturnType<typeof docsSchema>>[0]
