import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

import { getLocaleFromPath } from '../libs/page'
import { getRSSOptions, getRSSStaticPaths } from '../libs/rss'

export function getStaticPaths() {
  return getRSSStaticPaths()
}

export const GET: APIRoute = async ({ locals, params, site }) => {
  return rss(
    await getRSSOptions(site, getLocaleFromPath(params['prefix'] ?? ''), locals.t('starlightBlog.rss.imageFallback')),
  )
}
