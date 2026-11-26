import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

import { getBlogConfigFromPath, getLocaleFromPath } from '../libs/page'
import { getRSSArchiveOptions, getRSSArchiveStaticPaths } from '../libs/rss'

export function getStaticPaths() {
  return getRSSArchiveStaticPaths()
}

export const GET: APIRoute = async ({ locals, params, site }) => {
  const prefix = params['prefix'] ?? ''
  const config = getBlogConfigFromPath(prefix)
  if (!config) throw new Error(`Unknown blog prefix '${prefix}'.`)
  if (!config.rss) throw new Error(`RSS is disabled for blog prefix '${prefix}'.`)

  return rss(
    await getRSSArchiveOptions(config, site, getLocaleFromPath(params['prefix'] ?? ''), params['archive'], locals.t),
  )
}
