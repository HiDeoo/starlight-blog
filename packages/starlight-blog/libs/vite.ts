import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

const componentAliases = ['MarkdownContent', 'Page', 'Sidebar', 'SocialIcons'] as const

const aliasIds = new Map<ComponentAlias, string>()

// Alias various starlight components to local ones.
// The local components should be located in the `components` directory, use the same name as the aliased component,
// and be prefixed with an underscore.
export function vitePluginStarlightBlogComponents(): VitePlugin {
  return {
    enforce: 'pre',
    name: 'vite-plugin-starlight-blog-components',
    async resolveId(id, importer, options) {
      if (id.startsWith('/@fs') || importer?.endsWith('.html')) {
        return
      }

      for (const alias of componentAliases) {
        if (id.endsWith(`/${alias}.astro`)) {
          // If the component is imported by starlight, use the aliased component.
          if (!importer?.includes('starlight-blog/components')) {
            const resolvedAlias = await this.resolve(id, importer, { ...options, skipSelf: true })

            if (resolvedAlias) {
              aliasIds.set(alias, resolvedAlias.id)
            }

            return path.join(path.dirname(fileURLToPath(import.meta.url)), `../components/_${alias}.astro`)
          }

          // If the component is imported internally by starlight-blog, use the original component.
          return aliasIds.get(alias)
        }
      }

      return
    },
  }
}

// Expose the starlight-blog integration configuration.
export function vitePluginStarlightBlogConfig(config: StarlightBlogConfig): VitePlugin {
  const moduleId = 'virtual:starlight-blog-config'
  const resolvedModuleId = `\0${moduleId}`
  const moduleContent = `export default ${JSON.stringify({ ...config, locale: 'en' })}`

  return {
    name: 'vite-plugin-starlight-blog-config',
    load(id) {
      return id === resolvedModuleId ? moduleContent : undefined
    },
    resolveId(id) {
      return id === moduleId ? resolvedModuleId : undefined
    },
  }
}

type ComponentAlias = (typeof componentAliases)[number]

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
