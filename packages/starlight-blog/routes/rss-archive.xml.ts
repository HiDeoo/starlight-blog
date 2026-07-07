import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

import { getLocaleFromPath } from '../libs/page'
import { getRSSArchiveOptions, getRSSArchiveStaticPaths } from '../libs/rss'

export function getStaticPaths() {
  return getRSSArchiveStaticPaths()
}

export const GET: APIRoute = async ({ locals, params, site }) => {
  return rss(await getRSSArchiveOptions(site, getLocaleFromPath(params['prefix'] ?? ''), params['archive'], locals.t))
}
