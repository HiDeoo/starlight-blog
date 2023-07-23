import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export const blogAuthorSchema = z.object({
  /**
   * The name of the author.
   */
  name: z.string().min(1),
  /**
   * The URL or path to the author's picture.
   */
  picture: z.string().optional(),
  /**
   * The URL to the author's website.
   */
  url: z.string().url().optional(),
})

export const blogEntrySchema = z.object({
  /**
   * The authors of the blog post.
   * If not provided, the authors will be inferred from the `authors` configuration option if defined.
   */
  authors: z.union([z.string(), blogAuthorSchema, z.array(z.union([z.string(), blogAuthorSchema]))]).optional(),
  /**
   * The date of the blog post which must be a valid YAML timestamp.
   * @see https://yaml.org/type/timestamp.html
   */
  date: z.date(),
  /**
   * The excerpt of the blog post used in the blog post list and tags pages.
   * If not provided, the entire blog post content will be used.
   */
  excerpt: z.string().optional(),
  /**
   * A list of tags associated with the blog post.
   */
  tags: z.string().array().optional(),
})

export function docsAndBlogSchema(context: SchemaContext) {
  return docsSchema()(context).merge(blogEntrySchema.partial())
}

export type StarlightBlogAuthor = z.infer<typeof blogAuthorSchema>

type SchemaContext = Parameters<ReturnType<typeof docsSchema>>[0]
