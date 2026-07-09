/// <reference path="./locals.d.ts" />

import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegrationLogger } from 'astro'

import { type StarlightBlogConfig, validateConfig, type StarlightBlogUserConfig } from './libs/config'
import { isNavigationWithCustomCss, isNavigationOverride } from './libs/navigation'
import { stripLeadingSlash, stripTrailingSlash } from './libs/path'
import { applyMarkdownPlugin } from './libs/processor'
import { vitePluginStarlightBlog } from './libs/vite'
import { Translations } from './translations'

export type { StarlightBlogConfig, StarlightBlogUserConfig }

export default function starlightBlogPlugin(userConfig?: StarlightBlogUserConfig): StarlightPlugin {
  const configs = validateConfig(userConfig)

  return {
    name: 'starlight-blog',
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

        const rssLinks = astroConfig.site
          ? configs
              .filter((config) => config.rss)
              .map((config) => ({
                href: `${stripTrailingSlash(
                  astroConfig.site as string,
                )}${stripTrailingSlash(astroConfig.base)}/${stripLeadingSlash(
                  stripTrailingSlash(config.prefix),
                )}/rss.xml`,
                title: config.title,
              }))
          : []

        const components: StarlightUserConfig['components'] = { ...starlightConfig.components }
        overrideComponent(components, logger, 'MarkdownContent')
        if (configs.some((config) => config.navigation === 'header-start')) {
          overrideComponent(components, logger, 'SiteTitle')
        }
        if (configs.some((config) => config.navigation === 'header-end')) {
          overrideComponent(components, logger, 'ThemeSelect')
        }

        const customCss: StarlightUserConfig['customCss'] = [...(starlightConfig.customCss ?? [])]
        if (configs.some(isNavigationWithCustomCss)) customCss.push('starlight-blog/styles')

        const head: StarlightUserConfig['head'] = [...(starlightConfig.head ?? [])]

        for (const { href, title } of rssLinks) {
          head.push({
            tag: 'link',
            attrs: {
              href,
              rel: 'alternate',
              title: typeof title === 'string' ? title : 'Blog',
              type: 'application/rss+xml',
            },
          })
        }

        const configIncludesRSSSocial = starlightConfig.social?.some((social) => social.icon === 'rss') ?? false
        const social: StarlightUserConfig['social'] = [...(starlightConfig.social ?? [])]
        const rssLink = rssLinks[0]

        if (rssLinks.length === 1 && rssLink && !configIncludesRSSSocial) {
          social.push({
            href: rssLink.href,
            icon: 'rss',
            label: 'RSS',
          })
        }

        updateStarlightConfig({ components, customCss, head, social })

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

              if (rssLinks.length > 0) {
                injectRoute({
                  entrypoint: 'starlight-blog/routes/rss',
                  pattern: '/[...prefix]/rss.xml',
                  prerender: true,
                })

                injectRoute({
                  entrypoint: 'starlight-blog/routes/rss-archive',
                  pattern: '/[...prefix]/rss/[archive].xml',
                  prerender: true,
                })
              }

              applyMarkdownPlugin(astroConfig.markdown.processor)

              updateConfig({ vite: { plugins: [vitePluginStarlightBlog(configs, starlightConfig, astroConfig)] } })
            },
          },
        })
      },
    },
  }
}

function overrideComponent(
  components: NonNullable<StarlightUserConfig['components']>,
  logger: AstroIntegrationLogger,
  component: keyof NonNullable<StarlightUserConfig['components']>,
) {
  if (components[component]) {
    logger.warn(`It looks like you already have a \`${component}\` component override in your Starlight configuration.`)
    logger.warn(
      `To use \`starlight-blog\`, either${isNavigationOverride(component) ? ` update the \`navigation\` plugin option,` : ''} remove your override or update it to render the content from \`starlight-blog/components/${component}.astro\`.`,
    )
    return
  }

  components[component] = `starlight-blog/overrides/${component}.astro`
}
