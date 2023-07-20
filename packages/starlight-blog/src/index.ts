import type { AstroIntegration, AstroUserConfig } from 'astro'

import { vitePluginStarlightBlog } from './libs/vite'

export default function starlightBlogIntegration(): AstroIntegration {
  return {
    name: 'starlight-blog',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        const config: AstroUserConfig = {
          vite: {
            plugins: [vitePluginStarlightBlog()],
          },
        }

        updateConfig(config)
      },
    },
  }
}
