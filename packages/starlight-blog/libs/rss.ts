import type { RSSOptions } from '@astrojs/rss'
import config from 'virtual:starlight-blog-config'
import context from 'virtual:starlight-blog-context'

import { getBlogEntries, type StarlightBlogEntry } from './content'
import { renderMarkdownToHTML, stripMarkdown } from './markdown'
import { getPathWithBase } from './page'

export function getRSSStaticPaths() {
  return [{ params: { prefix: config.prefix } }]
}

export async function getRSSOptions(site: URL | undefined) {
  const entries = await getBlogEntries()
  entries.splice(20)

  const options: RSSOptions = {
    title: getRSSTitle(),
    description: context.description ?? '',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The route is only injected if `site` is defined in the user Astro config.
    site: site!,
    items: await Promise.all(
      entries.map(async (entry) => {
        return {
          title: entry.data.title,
          link: getPathWithBase(`/${entry.slug}`),
          pubDate: entry.data.date,
          categories: entry.data.tags,
          description: await getRSSDescription(entry),
          content: await getRSSContent(entry),
        }
      }),
    ),
    customData: `<language>${context.defaultLocale}</language>`,
  }

  if (context.trailingSlash !== 'ignore') {
    options.trailingSlash = context.trailingSlash === 'always'
  }

  return options
}

function getRSSTitle() {
  let title = (typeof context.title === 'string' ? context.title : context.title[context.defaultLocale]) ?? ''

  if (title.length > 0) {
    title += ` ${context.titleDelimiter ?? '|'} `
  }

  title += config.title

  return title
}

function getRSSDescription(entry: StarlightBlogEntry): Promise<string> | undefined {
  if (!entry.data.excerpt) return

  return stripMarkdown(entry.data.excerpt)
}

function getRSSContent(entry: StarlightBlogEntry): Promise<string> {
  return renderMarkdownToHTML(entry.body)
}
