import { AstroError } from 'astro/errors'
import { z } from 'astro/zod'

import { blogAuthorSchema } from '../schema'

const configSchema = z
  .object({
    /**
     * A list of global author(s).
     *
     * Global authors are keyed by a unique identifier that can also be referenced in a blog post `authors` frontmatter
     * field.
     */
    authors: z.record(blogAuthorSchema).default({}),
    /**
     * The order of the previous and next links in the blog.
     *
     * By default, next links will point to the next blog post towards the past (`reverse-chronological`).
     * Setting this option to `chronological` will make next links point to the next blog post towards the future.
     */
    prevNextLinksOrder: z
      .union([z.literal('chronological'), z.literal('reverse-chronological')])
      .default('reverse-chronological'),
    /**
     * The number of blog posts to display per page in the blog post list.
     */
    postCount: z.number().min(1).default(5),
    /**
     * The number of recent blog posts to display in the sidebar.
     */
    recentPostCount: z.number().min(1).default(10),
    /**
     * The title of the blog.
     */
    title: z.string().default('Blog'),
  })
  .default({})

export function validateConfig(userConfig: unknown): StarlightBlogConfig {
  const config = configSchema.safeParse(userConfig)

  if (!config.success) {
    const errors = config.error.flatten()

    throw new AstroError(
      `Invalid starlight-blog configuration:

${errors.formErrors.map((formError) => ` - ${formError}`).join('\n')}
${Object.entries(errors.fieldErrors)
  .map(([fieldName, fieldErrors]) => ` - ${fieldName}: ${fieldErrors.join(' - ')}`)
  .join('\n')}
  `,
      `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/starlight-blog/issues/new/choose`,
    )
  }

  return config.data
}

export type StarlightBlogUserConfig = z.input<typeof configSchema>
export type StarlightBlogConfig = z.output<typeof configSchema>
