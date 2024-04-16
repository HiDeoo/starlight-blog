import type { AstroConfig, ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

// Expose the starlight-blog plugin configuration and project context.
export function vitePluginStarlightBlogConfig(
  starlightBlogConfig: StarlightBlogConfig,
  context: StarlightBlogContext,
): VitePlugin {
  const modules = {
    'virtual:starlight-blog-config': `export default ${JSON.stringify(starlightBlogConfig)}`,
    'virtual:starlight-blog-context': `export default ${JSON.stringify({
      trailingSlash: context.trailingSlash,
    })}`,
  }

  const moduleResolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [resolveVirtualModuleId(key), key]),
  )

  return {
    name: 'vite-plugin-starlight-blog',
    load(id) {
      const moduleId = moduleResolutionMap[id]
      return moduleId ? modules[moduleId] : undefined
    },
    resolveId(id) {
      return id in modules ? resolveVirtualModuleId(id) : undefined
    },
  }
}

function resolveVirtualModuleId<TModuleId extends string>(id: TModuleId): `\0${TModuleId}` {
  return `\0${id}`
}

export interface StarlightBlogContext {
  trailingSlash: AstroConfig['trailingSlash']
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
