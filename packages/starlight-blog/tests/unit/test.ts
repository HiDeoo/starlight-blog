import { getViteConfig } from 'astro/config'

import { validateConfig, type StarlightBlogUserConfig } from '../../libs/config'
import { vitePluginStarlightBlogConfig, type StarlightBlogContext } from '../../libs/vite'

export function defineVitestConfig(userConfig: StarlightBlogUserConfig, context?: Partial<StarlightBlogContext>) {
  const config = validateConfig(userConfig)

  const rootDir = new URL('./', import.meta.url)
  const srcDir = new URL('src/', rootDir)

  return getViteConfig({
    plugins: [
      vitePluginStarlightBlogConfig(config, {
        description: context?.description,
        rootDir: rootDir.pathname,
        site: context?.site,
        srcDir: srcDir.pathname,
        title: context?.title ?? 'Starlight Blog Test',
        titleDelimiter: context?.titleDelimiter,
        trailingSlash: context?.trailingSlash ?? 'ignore',
      }),
      {
        name: 'virtual-modules',
        load(id) {
          return id === 'virtual:starlight-blog-test'
            ? `export default ${JSON.stringify({ defaultLocale: { lang: 'en' } })}`
            : undefined
        },
        resolveId(id) {
          return id === 'virtual:starlight/user-config' ? 'virtual:starlight-blog-test' : undefined
        },
      },
    ],
  })
}
