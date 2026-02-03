import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig, ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

// Expose the starlight-blog plugin configuration and project context.
export function vitePluginStarlightBlogConfig(
  starlightBlogConfig: StarlightBlogConfig,
  context: StarlightBlogContext,
): VitePlugin {
  const modules = {
    'virtual:starlight-blog-config': `export default ${JSON.stringify(starlightBlogConfig)}`,
    'virtual:starlight-blog-context': `export default ${JSON.stringify(context)}`,
    'virtual:starlight-blog-images': getImagesVirtualModule(starlightBlogConfig, context),
  }

  const moduleResolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [resolveVirtualModuleId(key), key]),
  )

  return {
    name: 'vite-plugin-starlight-blog',
    load(id) {
      const moduleId = moduleResolutionMap[id]
      if (moduleId) return modules[moduleId]

      if (id.startsWith(resolveVirtualModuleId('virtual:starlight-blog/components/'))) {
        return resolveComponentModule(id, starlightBlogConfig)
      }

      return undefined
    },
    resolveId(id) {
      if (id in modules) return resolveVirtualModuleId(id)

      if (id.startsWith('virtual:starlight-blog/components/')) {
        return resolveVirtualModuleId(id)
      }
      return undefined
    },
  }
}

export function getImagesVirtualModule(starlightBlogConfig: StarlightBlogConfig, context: StarlightBlogContext) {
  let module = ''
  const authors = Object.entries(starlightBlogConfig.authors)

  for (const [id, author] of authors) {
    if (!author.picture?.startsWith('.')) continue
    module += `import ${id} from ${resolveModuleId(author.picture, context)};\n`
  }

  module += 'export const authors = {\n'
  for (const [id, author] of authors) {
    if (!author.picture) continue
    module += `  "${author.name}": ${author.picture.startsWith('.') ? id : resolveModuleId(author.picture, context)},\n`
  }
  module += '};\n'

  return module
}

function resolveComponentModule(id: string, config: StarlightBlogConfig) {
  const componentName = id.replace(resolveVirtualModuleId('virtual:starlight-blog/components/'), '')

  if (config.components[componentName]) {
    return `export { default } from '${config.components[componentName]}';`
  }

  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const defaultPath = path.resolve(dirname, `../components/${componentName}.astro`)
  return `export { default } from '${pathToFileURL(defaultPath).href}';`
}

function resolveModuleId(id: string, context: StarlightBlogContext) {
  return JSON.stringify(id.startsWith('.') ? pathToFileURL(path.resolve(context.rootDir, id)).href : id)
}

function resolveVirtualModuleId<TModuleId extends string>(id: TModuleId): `\0${TModuleId}` {
  return `\0${id}`
}

export interface StarlightBlogContext {
  description: StarlightUserConfig['description']
  rootDir: string
  site: AstroConfig['site']
  srcDir: string
  title: StarlightUserConfig['title']
  titleDelimiter: StarlightUserConfig['titleDelimiter']
  trailingSlash: AstroConfig['trailingSlash']
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
