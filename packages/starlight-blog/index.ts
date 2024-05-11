import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegrationLogger } from 'astro'

import { type StarlightBlogConfig, validateConfig, type StarlightBlogUserConfig } from './libs/config'
import { getDefaultLocale } from './libs/i18n'
import { stripLeadingSlash, stripTrailingSlash } from './libs/path'
import { vitePluginStarlightBlogConfig } from './libs/vite'

export type { StarlightBlogConfig, StarlightBlogUserConfig }

export default function starlightBlogPlugin(userConfig?: StarlightBlogUserConfig): StarlightPlugin {
  const config = validateConfig(userConfig)

  return {
    name: 'starlight-blog-plugin',
    hooks: {
      setup({ addIntegration, astroConfig, config: starlightConfig, logger, updateConfig: updateStarlightConfig }) {
        updateStarlightConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(starlightConfig.components, logger, 'MarkdownContent'),
            ...overrideStarlightComponent(starlightConfig.components, logger, 'Sidebar'),
            ...overrideStarlightComponent(starlightConfig.components, logger, 'ThemeSelect'),
          },
          head: [
            ...(starlightConfig.head ?? []),
            ...(astroConfig.site
              ? [
                  {
                    tag: 'link' as const,
                    attrs: {
                      href: `${stripTrailingSlash(astroConfig.site)}${stripTrailingSlash(
                        astroConfig.base,
                      )}/${stripLeadingSlash(stripTrailingSlash(config.prefix))}/rss.xml`,
                      rel: 'alternate',
                      title: config.title,
                      type: 'application/rss+xml',
                    },
                  },
                ]
              : []),
          ],
        })

        addIntegration({
          name: 'starlight-blog-integration',
          hooks: {
            'astro:config:setup': ({ injectRoute, updateConfig }) => {
              injectRoute({
                entrypoint: 'starlight-blog/routes/Tags.astro',
                pattern: '/[prefix]/tags/[tag]',
                prerender: true,
              })

              injectRoute({
                entrypoint: 'starlight-blog/routes/Blog.astro',
                pattern: '/[prefix]/[...page]',
                prerender: true,
              })

              if (astroConfig.site) {
                injectRoute({
                  entrypoint: 'starlight-blog/routes/rss',
                  pattern: '/[prefix]/rss.xml',
                  prerender: true,
                })
              }

              updateConfig({
                vite: {
                  plugins: [
                    vitePluginStarlightBlogConfig(config, {
                      defaultLocale: getDefaultLocale(starlightConfig as StarlightUserConfig),
                      description: starlightConfig.description,
                      site: astroConfig.site,
                      title: starlightConfig.title,
                      titleDelimiter: starlightConfig.titleDelimiter,
                      trailingSlash: astroConfig.trailingSlash,
                    }),
                  ],
                },
              })
            },
          },
        })
      },
    },
  }
}

function overrideStarlightComponent(
  components: StarlightUserConfig['components'],
  logger: AstroIntegrationLogger,
  component: keyof NonNullable<StarlightUserConfig['components']>,
) {
  if (components?.[component]) {
    logger.warn(`It looks like you already have a \`${component}\` component override in your Starlight configuration.`)
    logger.warn(
      `To use \`starlight-blog\`, either remove your override or update it to render the content from \`starlight-blog/overrides/${component}.astro\`.`,
    )

    return {}
  }

  return {
    [component]: `starlight-blog/overrides/${component}.astro`,
  }
}
