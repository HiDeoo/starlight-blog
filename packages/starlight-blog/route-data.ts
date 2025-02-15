export interface StarlightBlogRouteData {
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
       * @see https://starlight-blog-docs.vercel.app/configuration/#name-required
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
