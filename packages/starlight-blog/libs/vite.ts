import path from 'node:path'

import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig, ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

// Expose the starlight-blog plugin configuration and project context.
export function vitePluginStarlightBlogConfig(
  starlightBlogConfigs: StarlightBlogConfig[],
  context: StarlightBlogContext,
): VitePlugin {
  const modules = {
    'virtual:starlight-blog/configs': getConfigsVirtualModule(starlightBlogConfigs),
    'virtual:starlight-blog/context': `export default ${JSON.stringify(context)}`,
    'virtual:starlight-blog/images': getImagesVirtualModule(starlightBlogConfigs, context),
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

function getConfigsVirtualModule(configs: StarlightBlogConfig[]) {
  const entries = configs.map((config) => [config.prefix, config] as const)

  return `const configs = new Map(${JSON.stringify(entries)});
export default configs;`
}

function getImagesVirtualModule(configs: StarlightBlogConfig[], context: StarlightBlogContext) {
  // A map of resolved local image module IDs to generated import names.
  const importedImages = new Map<string, string>()

  const imports: string[] = []
  const blogs: string[] = []
  let importIndex = 0

  for (const config of configs) {
    const authors: string[] = []

    for (const author of Object.values(config.authors)) {
      if (!author.picture) continue

      let pictureValue: string

      if (author.picture.startsWith('.')) {
        const moduleId = resolveModuleId(author.picture, context)
        let importName = importedImages.get(moduleId)

        if (!importName) {
          importName = `authorImage${importIndex++}`
          imports.push(`import ${importName} from ${moduleId};`)
          importedImages.set(moduleId, importName)
        }

        pictureValue = importName
      } else {
        pictureValue = resolveModuleId(author.picture, context)
      }

      authors.push(`${JSON.stringify(author.name)}: ${pictureValue},`)
    }

    blogs.push(`${JSON.stringify(config.prefix)}: { ${authors.join('\n')}  },`)
  }

  return `${imports.join('\n')}

export const authors = {
  ${blogs.join('\n')}
};`
}

function resolveModuleId(id: string, context: StarlightBlogContext) {
  return JSON.stringify(id.startsWith('.') ? path.resolve(context.rootDir, id) : id)
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
