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
    ],
  })
}
