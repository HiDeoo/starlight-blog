import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

import { getRSSOptions, getRSSStaticPaths } from '../libs/rss'

export function getStaticPaths() {
  return getRSSStaticPaths()
}

export const GET: APIRoute = async ({ site }) => {
  return rss(await getRSSOptions(site))
}
