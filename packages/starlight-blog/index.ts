import type { AstroIntegration, AstroUserConfig } from 'astro'

import { type StarlightBlogConfig, validateConfig } from './libs/config'
import { vitePluginStarlightBlogConfig } from './libs/vite'

export default function starlightBlogIntegration(userConfig?: StarlightBlogConfig): AstroIntegration {
  const config: StarlightBlogConfig = validateConfig(userConfig)

  return {
    name: 'starlight-blog',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        injectRoute({
          entryPoint: 'starlight-blog/routes/Tags.astro',
          pattern: '/blog/tags/[tag]',
        })

        injectRoute({
          entryPoint: 'starlight-blog/routes/Blog.astro',
          pattern: '/blog/[...page]',
        })

        const astroConfig: AstroUserConfig = {
          vite: {
            plugins: [vitePluginStarlightBlogConfig(config)],
          },
        }

        updateConfig(astroConfig)
      },
    },
  }
}
