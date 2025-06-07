import type { ImageMetadata } from 'astro'

import type { StarlightBlogEntry } from './libs/content'

export interface StarlightBlogData {
  /**
   * An list of all the blog posts in your project ordered by descending publication date.
   */
  posts: {
    /**
     * The authors of the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/authors/
     */
    authors: {
      /**
       * The name of the author.
       *
       * @see https://starlight-blog-docs.vercel.app/configuration/#name
       */
      name: string
      /**
       * An optional title for the author.
       *
       * @see https://starlight-blog-docs.vercel.app/configuration/#title-1
       */
      title?: string | undefined
      /**
       * An optional URL to link the author to.
       *
       * @see https://starlight-blog-docs.vercel.app/configuration/#url
       */
      url?: string | undefined
    }[]
    /**
     * The optional cover image of the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter#cover
     */
    cover?:
      | {
          /**
           * The alternative text describing the cover image for assistive technologies.
           */
          alt: string
          /**
           * The cover image metadata for a local image or a URL to a remote image to display.
           *
           * @see https://docs.astro.build/en/guides/images/#images-in-content-collections
           */
          image: ImageMetadata | string
        }
      | {
          /**
           * The alternative text describing the cover image for assistive technologies.
           */
          alt: string
          /**
           * The cover image metadata for a local image or a URL to a remote image to display in dark mode.
           *
           * @see https://docs.astro.build/en/guides/images/#images-in-content-collections
           */
          dark: ImageMetadata | string
          /**
           * The cover image metadata for a local image or a URL to a remote image to display in light mode.
           *
           * @see https://docs.astro.build/en/guides/images/#images-in-content-collections
           */
          light: ImageMetadata | string
        }
      | undefined
    /**
     * The date of the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#date-required
     */
    createdAt: Date
    /**
     * Whether the blog post is a draft.
     * Draft blog posts are only visible in development mode.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#draft
     */
    draft: boolean
    /**
     * The Astro content collection entry for the blog post which includes frontmatter values at `entry.data`.
     *
     * @see https://docs.astro.build/en/reference/modules/astro-content/#collectionentry
     */
    entry: StarlightBlogEntry
    /**
     * Whether the blog post is featured.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#featured
     */
    featured: boolean
    /**
     * The link to the blog post.
     */
    href: string
    /**
     * The metrics of the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/metrics/
     */
    metrics: {
      /**
       * The estimated reading time metrics of the blog post.
       *
       * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#readingtime
       */
      readingTime: {
        /**
         * The estimated reading time of the blog post in minutes, rounded up to the nearest minute.
         *
         * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#minutes
         */
        minutes: number
        /**
         * The estimated reading time of the blog post in seconds, rounded up to the nearest second.
         *
         * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#seconds
         */
        seconds: number
      }
      /**
       * The word count metrics of the blog post.
       *
       * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#words
       */
      words: {
        /**
         * The word count of the blog post rounded up to the nearest multiple of 100.
         *
         * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#rounded
         */
        rounded: number
        /**
         * The total word count of the blog post.
         *
         * @see https://starlight-blog-docs.vercel.app/guides/blog-data/#total
         */
        total: number
      }
    }
    /**
     * A list of tags associated with the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#tags
     */
    tags: {
      /**
       * The label of the tag.
       */
      label: string
      /**
       * The link to the tag page.
       */
      href: string
    }[]
    /**
     * The title of the blog post.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#title-required
     */
    title: string
    /**
     * The last update date of the blog post.
     * Defined only if the blog post has been updated and differs from the creation date.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/frontmatter/#lastupdated
     */
    updatedAt?: Date
  }[]
}
