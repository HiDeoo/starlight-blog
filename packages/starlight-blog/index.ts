import type { StarlightPlugin, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroIntegrationLogger } from 'astro'

import { type StarlightBlogConfig, validateConfig } from './libs/config'
import { vitePluginStarlightBlogConfig } from './libs/vite'

export type { StarlightBlogConfig }

export default function starlightBlogPlugin(userConfig?: StarlightBlogConfig): StarlightPlugin {
  const config: StarlightBlogConfig = validateConfig(userConfig)

  return {
    name: 'starlight-blog-plugin',
    hooks: {
      setup({ addIntegration, config: starlightConfig, logger, updateConfig: updateStarlightConfig }) {
        updateStarlightConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(starlightConfig.components, logger, 'MarkdownContent'),
            ...overrideStarlightComponent(starlightConfig.components, logger, 'Sidebar'),
            ...overrideStarlightComponent(starlightConfig.components, logger, 'ThemeSelect'),
          },
        })

        addIntegration({
          name: 'starlight-blog-integration',
          hooks: {
            'astro:config:setup': ({ injectRoute, updateConfig }) => {
              injectRoute({
                entrypoint: 'starlight-blog/routes/Tags.astro',
                pattern: '/blog/tags/[tag]',
                prerender: true,
              })

              injectRoute({
                entrypoint: 'starlight-blog/routes/Blog.astro',
                pattern: '/blog/[...page]',
                prerender: true,
              })

              updateConfig({
                vite: {
                  plugins: [vitePluginStarlightBlogConfig(config)],
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
    logger.warn(`To use \`starlight-blog\`, remove the override for the \`${component}\` component.\n`)

    return {}
  }

  return {
    [component]: `starlight-blog/overrides/${component}.astro`,
  }
}
