import { z } from 'astro/zod'

import { blogAuthorSchema } from './schema'

const configSchema = z
  .object({
    /**
     * A list of global author(s).
     * Global authors are keyed by a unique identifier that can also be referenced in a blog post `authors` frontmatter
     * field.
     */
    authors: z.record(blogAuthorSchema).default({}),
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

    throw new Error(`Invalid starlight-blog configuration:

${errors.formErrors.map((formError) => ` - ${formError}`).join('\n')}
${Object.entries(errors.fieldErrors)
  .map(([fieldName, fieldErrors]) => ` - ${fieldName}: ${fieldErrors.join(' - ')}`)
  .join('\n')}
  `)
  }

  return config.data
}

export type StarlightBlogConfig = z.infer<typeof configSchema>
