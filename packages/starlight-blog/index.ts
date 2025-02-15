/// <reference path="./locals.d.ts" />

import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegrationLogger } from 'astro'

import { type StarlightBlogConfig, validateConfig, type StarlightBlogUserConfig } from './libs/config'
import { stripLeadingSlash, stripTrailingSlash } from './libs/path'
import { vitePluginStarlightBlogConfig } from './libs/vite'
import { Translations } from './translations'

export type { StarlightBlogConfig, StarlightBlogUserConfig }

export default function starlightBlogPlugin(userConfig?: StarlightBlogUserConfig): StarlightPlugin {
  const config = validateConfig(userConfig)

  return {
    name: 'starlight-blog-plugin',
    hooks: {
      'i18n:setup'({ injectTranslations }) {
        injectTranslations(Translations)
      },
      'config:setup'({
        addIntegration,
        addRouteMiddleware,
        astroConfig,
        config: starlightConfig,
        logger,
        updateConfig: updateStarlightConfig,
      }) {
        addRouteMiddleware({ entrypoint: 'starlight-blog/middleware' })

        const rssLink = astroConfig.site
          ? `${stripTrailingSlash(astroConfig.site)}${stripTrailingSlash(astroConfig.base)}/${stripLeadingSlash(
              stripTrailingSlash(config.prefix),
            )}/rss.xml`
          : undefined

        updateStarlightConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(starlightConfig.components, logger, 'MarkdownContent'),
            ...overrideStarlightComponent(starlightConfig.components, logger, 'ThemeSelect'),
          },
          customCss: [...(starlightConfig.customCss ?? []), 'starlight-blog/styles'],
          head: [
            ...(starlightConfig.head ?? []),
            ...(astroConfig.site
              ? [
                  {
                    tag: 'link' as const,
                    attrs: {
                      href: rssLink,
                      rel: 'alternate',
                      title: typeof config.title === 'string' ? config.title : 'Blog',
                      type: 'application/rss+xml',
                    },
                  },
                ]
              : []),
          ],
          social: {
            ...starlightConfig.social,
            ...(astroConfig.site && rssLink && !starlightConfig.social?.rss
              ? {
                  rss: rssLink,
                }
              : {}),
          },
        })

        addIntegration({
          name: 'starlight-blog-integration',
          hooks: {
            'astro:config:setup': ({ injectRoute, updateConfig }) => {
              injectRoute({
                entrypoint: 'starlight-blog/routes/Tags.astro',
                pattern: '/[...prefix]/tags/[tag]',
                prerender: true,
              })

              injectRoute({
                entrypoint: 'starlight-blog/routes/Authors.astro',
                pattern: '/[...prefix]/authors/[author]',
                prerender: true,
              })

              injectRoute({
                entrypoint: 'starlight-blog/routes/Blog.astro',
                pattern: '/[...prefix]/[...page]',
                prerender: true,
              })

              if (astroConfig.site) {
                injectRoute({
                  entrypoint: 'starlight-blog/routes/rss',
                  pattern: '/[...prefix]/rss.xml',
                  prerender: true,
                })
              }

              updateConfig({
                vite: {
                  plugins: [
                    vitePluginStarlightBlogConfig(config, {
                      description: starlightConfig.description,
                      rootDir: astroConfig.root.pathname,
                      site: astroConfig.site,
                      srcDir: astroConfig.srcDir.pathname,
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
      `To use \`starlight-blog\`, either remove your override or update it to render the content from \`starlight-blog/components/${component}.astro\`.`,
    )

    return {}
  }

  return {
    [component]: `starlight-blog/overrides/${component}.astro`,
  }
}
