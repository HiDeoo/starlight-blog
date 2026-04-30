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
        name: 'vite-plugin-starlight-blog-test',
        load(id) {
          if (id !== 'virtual:starlight-blog/test') return undefined

          const config: Partial<StarlightConfig> = context?.locales
            ? {
                isMultilingual: true,
                defaultLocale: getDefaultLocaleConfig(context.locales),
                locales: context.locales,
              }
            : {
                isMultilingual: false,
                defaultLocale: { label: 'English', lang: 'en', dir: 'ltr', locale: undefined },
              }

          return `export default ${JSON.stringify(config)}`
        },
        resolveId(id) {
          return id === 'virtual:starlight/user-config' ? 'virtual:starlight-blog/test' : undefined
        },
      },
    ],
  })
}

function getDefaultLocaleConfig(locales: StarlightConfig['locales']) {
  const rootLocale = locales?.root

  if (rootLocale) {
    return {
      label: rootLocale.label,
      lang: rootLocale.lang,
      dir: rootLocale.dir,
      locale: 'root',
    }
  }

  return {
    label: 'English',
    lang: 'en',
    dir: 'ltr' as const,
    locale: 'en',
  }
}
