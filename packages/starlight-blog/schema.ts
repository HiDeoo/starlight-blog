import { AstroError } from 'astro/errors'
import { z, type ZodLiteral, type ZodNumber, type ZodObject, type ZodString, type ZodUnion } from 'astro/zod'

export const blogAuthorSchema = z.object({
  /**
   * The name of the author.
   */
  name: z.string().min(1),
  /**
   * The title of the author.
   */
  title: z.string().optional(),
  /**
   * The URL or path to the author's picture.
   */
  picture: z.string().optional(),
  /**
   * The URL to the author's website.
   */
  url: z.string().url().optional(),
})

export const blogEntrySchema = ({ image }: SchemaContext) =>
  z.object({
    /**
     * The author(s) of the blog post.
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
     * If not provided, the entire blog post content will be rendered.
     */
    excerpt: z.string().optional(),
    /**
     * A list of tags associated with the blog post.
     */
    tags: z.string().array().optional(),
    /**
     * An optional cover image for the blog post.
     */
    cover: z
      .union([
        z.object({
          /**
           * Alternative text describing the cover image for assistive technologies.
           */
          alt: z.string(),
          /**
           * Relative path to an image file in your project, e.g. `../../assets/cover.png`.
           */
          image: image(),
        }),
        z.object({
          /**
           * Alternative text describing the cover image for assistive technologies.
           */
          alt: z.string(),
          /**
           * Relative path to an image file in your project to use in dark mode, e.g. `../../assets/cover-dark.png`.
           */
          dark: image(),
          /**
           * Relative path to an image file in your project to use in light mode, e.g. `../../assets/cover-light.png`.
           */
          light: image(),
        }),
      ])
      .optional(),
    /**
     * Defines whether the blog post is featured or not.
     * Featured blog posts are displayed in a dedicated sidebar group above recent blog posts.
     */
    featured: z.boolean().optional(),
  })

export function blogSchema(context: SchemaContext) {
  // Checking for `context` to provide a better migration error message.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new AstroError(
      'Missing blog schema validation context.',
      `You may need to update your content collections configuration in the \`src/content.config.ts\` file and pass the context to the \`blogSchema\` function:

\`docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: (context) => blogSchema(context) }) })\`

If you believe this is a bug, please file an issue at https://github.com/HiDeoo/starlight-blog/issues/new/choose`,
    )
  }

  return blogEntrySchema(context).partial()
}

export type StarlightBlogAuthor = z.infer<typeof blogAuthorSchema>

interface SchemaContext {
  image: ImageFunction
}

// https://github.com/withastro/astro/blob/7d597506615fa5a34327304e8321be7b9c4b799d/packages/astro/src/assets/types.ts#L34-L42
type ImageFunction = () => ZodObject<{
  src: ZodString
  width: ZodNumber
  height: ZodNumber
  format: ZodUnion<
    [
      ZodLiteral<'png'>,
      ZodLiteral<'jpg'>,
      ZodLiteral<'jpeg'>,
      ZodLiteral<'tiff'>,
      ZodLiteral<'webp'>,
      ZodLiteral<'gif'>,
      ZodLiteral<'svg'>,
      ZodLiteral<'avif'>,
    ]
  >
}>
