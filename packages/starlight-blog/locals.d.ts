declare namespace App {
  type StarlightLocals = import('@astrojs/starlight').StarlightLocals
  interface Locals extends StarlightLocals {
    /**
     * Starlight Blog data.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/blog-data/
     */
    starlightBlog: import('./data').StarlightBlogData
  }
}

declare namespace StarlightApp {
  type Translations = typeof import('./translations').Translations.en
  interface I18n extends Translations {}
}
