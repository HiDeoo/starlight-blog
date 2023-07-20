import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export const blogEntrySchema = z.object({
  // TODO(HiDeoo) comment
  date: z.date(),
})

export function docsAndBlogSchema(context: SchemaContext) {
  return docsSchema()(context).merge(blogEntrySchema.partial())
}

type SchemaContext = Parameters<ReturnType<typeof docsSchema>>[0]
