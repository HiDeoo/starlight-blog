import { getViteConfig } from 'astro/config'

import { validateConfig, type StarlightBlogUserConfig } from '../../libs/config'
import { vitePluginStarlightBlog } from '../../libs/vite'

export function defineVitestConfig(
  userConfig: StarlightBlogUserConfig,
  context?: Partial<Parameters<typeof vitePluginStarlightBlog>[1]> &
    Partial<Pick<Parameters<typeof vitePluginStarlightBlog>[2], 'site' | 'trailingSlash'>>,
) {
  const config = validateConfig(userConfig)

  const rootDir = new URL('./', import.meta.url)
  const srcDir = new URL('src/', rootDir)

  return getViteConfig({
    plugins: [
      vitePluginStarlightBlog(
        config,
        {
          defaultLocale: context?.defaultLocale,
          description: context?.description,
          locales: context?.locales,
          title: context?.title ?? 'Starlight Blog Test',
          titleDelimiter: context?.titleDelimiter,
        },
        {
          root: rootDir,
          site: context?.site,
          srcDir,
          trailingSlash: context?.trailingSlash ?? 'ignore',
        },
      ),
    ],
  })
}
