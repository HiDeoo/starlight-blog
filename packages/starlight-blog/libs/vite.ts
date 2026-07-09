import path from 'node:path'

import type { StarlightConfig, StarlightUserConfig } from '@astrojs/starlight/types'
import type { AstroConfig, ViteUserConfig } from 'astro'

import type { StarlightBlogConfig } from './config'

const StarlightDefaultLocale = { label: 'English', lang: 'en', dir: 'ltr' } as const

// Expose the starlight-blog plugin configuration and project context.
export function vitePluginStarlightBlog(
  starlightBlogConfigs: StarlightBlogConfig[],
  starlightConfig: Pick<StarlightUserConfig, 'defaultLocale' | 'description' | 'locales' | 'title' | 'titleDelimiter'>,
  astroConfig: Pick<AstroConfig, 'root' | 'site' | 'srcDir' | 'trailingSlash'>,
): VitePlugin {
  const context = getContext(starlightConfig, astroConfig)

  const modules = {
    'virtual:starlight-blog/configs': getConfigsVirtualModule(starlightBlogConfigs),
    'virtual:starlight-blog/context': `export default ${JSON.stringify(context)}`,
    'virtual:starlight-blog/images': getImagesVirtualModule(starlightBlogConfigs, context),
  }

  const moduleResolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [resolveVirtualModuleId(key), key]),
  )

  return {
    name: 'starlight-blog',
    load(id) {
      const moduleId = moduleResolutionMap[id]
      return moduleId ? modules[moduleId] : undefined
    },
    resolveId(id) {
      return id in modules ? resolveVirtualModuleId(id) : undefined
    },
  }
}

function getContext(
  starlightConfig: Parameters<typeof vitePluginStarlightBlog>[1],
  astroConfig: Parameters<typeof vitePluginStarlightBlog>[2],
): StarlightBlogContext {
  let i18nContext: StarlightBlogI18nContext | undefined

  const { defaultLocale } = starlightConfig
  const locales = normalizeLocales(starlightConfig.locales)
  const configuredLocales = Object.keys(locales ?? {})

  // This is a multilingual site (more than one locale configured) or a monolingual site with
  // only one locale configured (not a root locale).
  if (
    locales !== undefined &&
    (configuredLocales.length > 1 || (configuredLocales.length === 1 && locales.root === undefined))
  ) {
    const defaultLocaleConfig = locales[defaultLocale ?? 'root']

    i18nContext = {
      defaultLocale: {
        label: defaultLocaleConfig?.label ?? StarlightDefaultLocale.label,
        lang: defaultLocaleConfig?.lang ?? normalizeLocaleLang(defaultLocale ?? 'root'),
        dir: defaultLocaleConfig?.dir ?? StarlightDefaultLocale.dir,
        locale: defaultLocale,
      },
      isMultilingual: configuredLocales.length > 1,
      locales,
    }
  } else {
    i18nContext = {
      defaultLocale: {
        ...StarlightDefaultLocale,
        ...(locales?.root
          ? { ...locales.root, ...(locales.root.dir ? { dir: locales.root.dir } : { dir: StarlightDefaultLocale.dir }) }
          : {}),
        locale: undefined,
      },
      isMultilingual: false,
      locales: undefined,
    }
  }

  return {
    ...i18nContext,
    description: starlightConfig.description,
    rootDir: astroConfig.root.pathname,
    site: astroConfig.site,
    srcDir: astroConfig.srcDir.pathname,
    title: starlightConfig.title,
    titleDelimiter: starlightConfig.titleDelimiter,
    trailingSlash: astroConfig.trailingSlash,
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

function normalizeLocales(locales: StarlightUserConfig['locales']) {
  if (!locales) return

  let normalizedLocales: StarlightUserConfig['locales']

  for (const [locale, localeConfig] of Object.entries(locales)) {
    if (!localeConfig) continue

    const lang = normalizeLocaleLang(locale, localeConfig.lang)
    if (lang === localeConfig.lang) continue

    normalizedLocales ??= { ...locales }
    normalizedLocales[locale] = { ...localeConfig, lang }
  }

  return normalizedLocales ?? locales
}

function normalizeLocaleLang(locale: string, lang = locale === 'root' ? StarlightDefaultLocale.lang : locale) {
  return new Intl.Locale(lang).toString()
}

interface StarlightBlogI18nContext {
  defaultLocale: StarlightConfig['defaultLocale']
  isMultilingual: StarlightConfig['isMultilingual']
  locales: StarlightUserConfig['locales']
}

export interface StarlightBlogContext extends StarlightBlogI18nContext {
  description: StarlightUserConfig['description']
  rootDir: string
  site: AstroConfig['site']
  srcDir: string
  title: StarlightUserConfig['title']
  titleDelimiter: StarlightUserConfig['titleDelimiter']
  trailingSlash: AstroConfig['trailingSlash']
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number]
