/// <reference path="./locals.d.ts" />

import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegrationLogger } from 'astro'

import { type StarlightBlogConfig, validateConfig, type StarlightBlogUserConfig } from './libs/config'
import { isNavigationWithCustomCss, isNavigationOverride } from './libs/navigation'
import { stripLeadingSlash, stripTrailingSlash } from './libs/path'
import { remarkStarlightBlog } from './libs/remark'
import { vitePluginStarlightBlogConfig } from './libs/vite'
import { Translations } from './translations'

export type { StarlightBlogConfig, StarlightBlogUserConfig }

export default function starlightBlogPlugin(userConfig?: StarlightBlogUserConfig): StarlightPlugin {
  const config = validateConfig(userConfig)

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
        addRouteMiddleware({ entrypoint: 'starlight-blog/middleware', order: 'post' })

        const rssLink = astroConfig.site
          ? `${stripTrailingSlash(astroConfig.site)}${stripTrailingSlash(astroConfig.base)}/${stripLeadingSlash(
              stripTrailingSlash(config.prefix),
            )}/rss.xml`
          : undefined

        const configIncludesRSSSocial = starlightConfig.social?.some((social) => social.icon === 'rss') ?? false

        const components: StarlightUserConfig['components'] = { ...starlightConfig.components }
        overrideComponent(components, logger, 'MarkdownContent')
        if (config.navigation === 'header-start') overrideComponent(components, logger, 'SiteTitle')
        if (config.navigation === 'header-end') overrideComponent(components, logger, 'ThemeSelect')

        const customCss: StarlightUserConfig['customCss'] = [...(starlightConfig.customCss ?? [])]
        if (isNavigationWithCustomCss(config)) customCss.push('starlight-blog/styles')

        const head: StarlightUserConfig['head'] = [...(starlightConfig.head ?? [])]
        if (astroConfig.site) {
          head.push({
            tag: 'link',
            attrs: {
              href: rssLink,
              rel: 'alternate',
              title: typeof config.title === 'string' ? config.title : 'Blog',
              type: 'application/rss+xml',
            },
          })
        }

        const social: StarlightUserConfig['social'] = [...(starlightConfig.social ?? [])]
        if (astroConfig.site && rssLink && !configIncludesRSSSocial) {
          social.push({
            href: rssLink,
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

              if (astroConfig.site) {
                injectRoute({
                  entrypoint: 'starlight-blog/routes/rss',
                  pattern: '/[...prefix]/rss.xml',
                  prerender: true,
                })
              }

              updateConfig({
                markdown: {
                  remarkPlugins: [[remarkStarlightBlog]],
                },
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
