import type { ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

// Expose the starlight-blog integration configuration.
export function vitePluginStarlightBlogConfig(config: StarlightBlogConfig): VitePlugin {
  const moduleId = 'virtual:starlight-blog-config'
  const resolvedModuleId = `\0${moduleId}`
  const moduleContent = `export default ${JSON.stringify(config)}`

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

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
