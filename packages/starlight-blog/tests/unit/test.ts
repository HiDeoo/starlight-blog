import { getViteConfig } from 'astro/config'

import { validateConfig, type StarlightBlogUserConfig } from '../../libs/config'
import { vitePluginStarlightBlogConfig, type StarlightBlogContext } from '../../libs/vite'

export function defineVitestConfig(userConfig: StarlightBlogUserConfig, context?: StarlightBlogContext) {
  const config = validateConfig(userConfig)

  return getViteConfig({
    plugins: [
      vitePluginStarlightBlogConfig(config, {
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
