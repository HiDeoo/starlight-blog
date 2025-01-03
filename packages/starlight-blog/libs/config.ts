import { AstroError } from 'astro/errors'
import { z } from 'astro/zod'

import { blogAuthorSchema } from '../schema'

import { stripLeadingSlash, stripTrailingSlash } from './path'

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
     * The base prefix for all blog routes.
     *
     * @default 'blog'
     */
    prefix: z
      .string()
      .default('blog')
      .transform((value) => stripTrailingSlash(stripLeadingSlash(value))),
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
    postCount: z.number().min(1).default(5).transform(infinityToMax),
    /**
     * The number of recent blog posts to display in the sidebar.
     */
    recentPostCount: z.number().min(1).default(10).transform(infinityToMax),
    /**
     * The title of the blog.
     *
     * The value can be a string, or for multilingual sites, an object with values for each different locale.
     * When using the object form, the keys must be BCP-47 tags (e.g. `en`, `ar`, or `zh-CN`).
     */
    title: z.union([z.string(), z.record(z.string())]).default('Blog'),

    /**
     * Show the Blog link in the theme selector (top nav-bar).
     */
    enableLinkInThemeSelector: z.boolean().default(true)
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

function infinityToMax(value: number): number {
  return value === Infinity ? Number.MAX_SAFE_INTEGER : value
}

export type StarlightBlogUserConfig = z.input<typeof configSchema>
export type StarlightBlogConfig = z.output<typeof configSchema>
