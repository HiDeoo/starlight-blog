import type { StarlightBlogData } from './data'
import type { Translations } from './translations'

type StarlightBlogTranslations = typeof Translations.en

declare global {
  namespace App {
    interface Locals {
      /**
       * Starlight Blog data.
       *
       * @see https://starlight-blog-docs.vercel.app/guides/blog-data/
       */
      starlightBlog: StarlightBlogData
      /**
       * Starlight Blog data for all configured blog instances, keyed by blog prefix.
       * Use instead of `locals.starlightBlog` when using multiple blog instances.
       *
       * @see https://starlight-blog-docs.vercel.app/guides/multiple-instances/#use-blog-data
       */
      starlightBlogs: ReadonlyMap<string, StarlightBlogData>
    }
  }

  namespace StarlightApp {
    interface I18n extends StarlightBlogTranslations {}
  }
}
