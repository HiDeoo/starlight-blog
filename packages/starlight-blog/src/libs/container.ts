import mdxRenderer from '@astrojs/mdx/server.js'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { render } from 'astro:content'

import type { StarlightBlogEntry } from './content'

const container = await AstroContainer.create()
container.addServerRenderer({ name: 'mdx', renderer: mdxRenderer })

export async function renderBlogEntryToString(entry: StarlightBlogEntry, t: App.Locals['t']) {
  const { Content } = await render(entry)
  // @ts-expect-error - Skip Starlight Blog data.
  return container.renderToString(Content, { locals: { t } })
}
