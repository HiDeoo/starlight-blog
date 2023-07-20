import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ViteUserConfig } from 'astro'

const componentAliases = ['Page', 'Sidebar', 'SocialIcons'] as const

const aliasIds = new Map<ComponentAlias, string>()

// Alias various starlight components to local ones.
// The local components should be located in the `src/components` directory, use the same name as the aliased component,
// and be prefixed with an underscore.
export function vitePluginStarlightBlog(): VitePlugin {
  return {
    enforce: 'pre',
    name: 'vite-plugin-starlight-blog',
    async resolveId(source, importer, options) {
      if (source.startsWith('/@fs')) {
        return
      }

      for (const alias of componentAliases) {
        if (source.endsWith(`/${alias}.astro`)) {
          // If the component is imported by starlight, use the aliased component.
          if (!importer?.includes('starlight-blog/src/components')) {
            const resolvedAlias = await this.resolve(source, importer, { ...options, skipSelf: true })

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

type ComponentAlias = (typeof componentAliases)[number]

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
