import path from 'node:path'

import type { AstroIntegration, AstroUserConfig, ViteUserConfig } from 'astro'

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

const starlightComponentOverrides = {
  Sidebar: 'BlogSidebar',
  SocialIcons: 'BlogSocialIcons',
}

const overriddenStarlightComponents = Object.keys(
  starlightComponentOverrides,
) as (keyof typeof starlightComponentOverrides)[]

function vitePluginStarlightBlog(): NonNullable<ViteUserConfig['plugins']>[number] {
  return {
    enforce: 'pre',
    name: 'vite-plugin-starlight-blog',
    resolveId(source, importer) {
      if (source.startsWith('/node_modules')) {
        return
      }

      for (const component of overriddenStarlightComponents) {
        if (source.endsWith(`/${component}.astro`)) {
          if (importer?.includes('node_modules')) {
            return path.resolve(
              `node_modules/starlight-blog/src/components/${starlightComponentOverrides[component]}.astro`,
            )
          }

          return path.resolve(`node_modules/@astrojs/starlight/components/${component}.astro`)
        }
      }

      return
    },
  }
}
