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
     * The configuration of various metrics that can be displayed alongside blog posts.
     */
    metrics: z
      .object({
        /**
         * Controls whether or not the estimated reading time of blog posts are displayed.
         * The estimated reading time is displayed in minutes, rounded up to the nearest minute.
         *
         * @default false
         */
        readingTime: z.boolean().default(false),
        /**
         * Controls whether or not the word count of blog posts are displayed.
         *
         * - `false` does not display the word count.
         * - `total` displays the total word count of the blog post.
         * - `rounded` displays the word count of the blog post rounded up to the nearest multiple of 100.
         *
         * @default false
         */
        words: z.union([z.literal(false), z.literal('total'), z.literal('rounded')]).default(false),
      })
      .default({ readingTime: false, words: false }),
    /**
     * The type of navigation links to display on a page.
     *
     * - `header-start` adds a link to the blog after the site title or logo in the header on large viewports.
     * - `header-end` adds a link to the blog before the theme switcher in the header on large viewports.
     * - `none` does not add any links to the blog.
     *
     * @default 'header-end'
     */
    navigation: z.union([z.literal('header-start'), z.literal('header-end'), z.literal('none')]).default('header-end'),
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
