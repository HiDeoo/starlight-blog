import mdxRenderer from '@astrojs/mdx/server.js'
import type { RSSOptions } from '@astrojs/rss'
import type { GetStaticPathsResult } from 'astro'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { render } from 'astro:content'
import { DOCTYPE_NODE, ELEMENT_NODE, TEXT_NODE, transform, walk, type Node } from 'ultrahtml'
import sanitize from 'ultrahtml/transformers/sanitize'
import starlightConfig from 'virtual:starlight/user-config'
import config from 'virtual:starlight-blog-config'
import context from 'virtual:starlight-blog-context'

import { getBlogEntries, type StarlightBlogEntry } from './content'
import { DefaultLocale, getLangFromLocale, type Locale } from './i18n'
import { stripMarkdown } from './markdown'
import { getPathWithLocale, getRelativeUrl } from './page'
import { stripTrailingSlash } from './path'
import { getBlogTitle } from './title'

export function getRSSStaticPaths() {
  const paths = []

  if (starlightConfig.isMultilingual) {
    for (const localeKey of Object.keys(starlightConfig.locales)) {
      const locale = localeKey === 'root' ? undefined : localeKey
      paths.push(getRSSStaticPath(locale))
    }
  } else {
    paths.push(getRSSStaticPath(DefaultLocale))
  }

  return paths satisfies GetStaticPathsResult
}

export async function getRSSOptions(site: URL | undefined, locale: Locale, t: App.Locals['t']) {
  let entries = await getBlogEntries(locale)
  entries = entries.slice(0, 20)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The route is only injected if `site` is defined in the user Astro config.
  const feedSite = site!

  const container = await AstroContainer.create()
  container.addServerRenderer({ name: 'mdx', renderer: mdxRenderer })

  const options: RSSOptions = {
    title: getRSSTitle(locale),
    description: context.description ?? '',
    site: feedSite,
    items: await Promise.all(
      entries.map(async (entry) => {
        const link = getRelativeUrl(`/${getPathWithLocale(entry.id, locale)}`)

        return {
          title: entry.data.title,
          link,
          pubDate: entry.data.date,
          categories: entry.data.tags,
          description: await getRSSDescription(entry),
          content: await getRSSContent(entry, feedSite, container, t),
        }
      }),
    ),
    customData: `<language>${getLangFromLocale(locale)}</language>`,
  }

  if (context.trailingSlash !== 'ignore') {
    options.trailingSlash = context.trailingSlash === 'always'
  }

  return options
}

function getRSSStaticPath(locale: Locale) {
  return {
    params: {
      prefix: getPathWithLocale(config.prefix, locale),
    },
  }
}

function getRSSTitle(locale: Locale): string {
  let title: string

  if (typeof context.title === 'string') {
    title = context.title
  } else {
    const lang = getLangFromLocale(locale)
    if (starlightConfig.title[lang]) {
      title = starlightConfig.title[lang]
    } else {
      const defaultLang = starlightConfig.defaultLocale.lang ?? starlightConfig.defaultLocale.locale
      title = defaultLang ? (starlightConfig.title[defaultLang] ?? '') : ''
    }
  }

  if (title.length > 0) {
    title += ` ${context.titleDelimiter ?? '|'} `
  }

  title += getBlogTitle(locale)

  return title
}

function getRSSDescription(entry: StarlightBlogEntry): Promise<string> | undefined {
  if (!entry.data.excerpt) return

  return stripMarkdown(entry.data.excerpt)
}

async function getRSSContent(
  entry: StarlightBlogEntry,
  baseURL: URL,
  container: AstroContainer,
  t: App.Locals['t'],
): Promise<string> {
  const { Content } = await render(entry)
  // @ts-expect-error - Skip Starlight Blog data.
  const html = await container.renderToString(Content, { locals: { t } })

  const content = await transform(html, [
    async (node) => {
      // Thanks @delucis - https://github.com/delucis/astro-blog-full-text-rss/blob/204be3d5b84357d9a8e6b73ee751766b76ad727e/src/pages/rss.xml.ts
      // Thanks @Princesseuh - https://github.com/Princesseuh/erika.florist/blob/90d0063b3524b27aae193aff768db12709be0d05/src/middleware.ts
      await walk(node, (node) => {
        // Remove doctype preamble.
        if (node.type === DOCTYPE_NODE) {
          removeHTMLNode(node)
        } else if (node.type === ELEMENT_NODE) {
          // Transform link with relative path to absolute URL.
          if (node.name === 'a' && node.attributes['href']?.startsWith('/')) {
            node.attributes['href'] = stripTrailingSlash(baseURL.href) + node.attributes['href']
          }
          // Transform image with relative path to absolute URL.
          if (node.name === 'img' && node.attributes['src']?.startsWith('/')) {
            node.attributes['src'] = stripTrailingSlash(baseURL.href) + node.attributes['src']
          }
          // Remove aside icons.
          if (node.name === 'svg' && node.attributes['class']?.includes('starlight-aside__icon')) {
            removeHTMLNode(node)
          }
          // Remove Expressive Code copy button.
          if (node.attributes['data-code']) {
            removeHTMLNode(node)
          }
        }
      })

      return node
    },
    sanitize({
      dropAttributes: {
        class: ['*'],
        'data-astro-source-file': ['*'],
        'data-astro-source-loc': ['*'],
      },
      dropElements: ['link', 'script', 'style'],
    }),
  ])

  // Strips empty attributes with no name if any.
  return content.replaceAll(/\s=""\s/g, ' ')
}

function removeHTMLNode(node: Node) {
  node.type = TEXT_NODE
  node.value = ''
}
