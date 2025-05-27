import type { StarlightConfig } from '@astrojs/starlight/types'
import { getViteConfig } from 'astro/config'

import { validateConfig, type StarlightBlogUserConfig } from '../../libs/config'
import { vitePluginStarlightBlogConfig, type StarlightBlogContext } from '../../libs/vite'

export function defineVitestConfig(
  userConfig: StarlightBlogUserConfig,
  context?: Partial<StarlightBlogContext> & {
    locales?: StarlightConfig['locales']
  },
) {
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
          if (id !== 'virtual:starlight-blog-test') return undefined

          const config: Partial<StarlightConfig> = context?.locales
            ? {
                isMultilingual: true,
                defaultLocale: { label: 'English', lang: 'en', dir: 'ltr', locale: 'en' },
                locales: context.locales,
              }
            : {
                isMultilingual: false,
                defaultLocale: { label: 'English', lang: 'en', dir: 'ltr', locale: undefined },
              }

          return `export default ${JSON.stringify(config)}`
        },
        resolveId(id) {
          return id === 'virtual:starlight/user-config' ? 'virtual:starlight-blog-test' : undefined
        },
      },
    ],
  })
}
