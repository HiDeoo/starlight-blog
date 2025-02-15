declare namespace App {
  type StarlightLocals = import('@astrojs/starlight').StarlightLocals
  interface Locals extends StarlightLocals {
    /**
     * Starlight Blog route data.
     *
     * @see https://starlight-blog-docs.vercel.app/guides/route-data/
     */
    starlightBlog: import('./route-data').StarlightBlogRouteData
  }
}

declare namespace StarlightApp {
  type Translations = typeof import('./translations').Translations.en
  interface I18n extends Translations {}
}
