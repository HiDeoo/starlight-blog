import { COMMENT_NODE, DOCTYPE_NODE, ELEMENT_NODE, TEXT_NODE, transform, walk, type Node } from 'ultrahtml'
import sanitize from 'ultrahtml/transformers/sanitize'

import { stripTrailingSlash } from './path'

export async function transformHTMLForRSS(html: string, baseURL: URL) {
  const content = await transform(html, [
    async (node) => {
      // Thanks @delucis - https://github.com/delucis/astro-blog-full-text-rss/blob/204be3d5b84357d9a8e6b73ee751766b76ad727e/src/pages/rss.xml.ts
      // Thanks @Princesseuh - https://github.com/Princesseuh/erika.florist/blob/90d0063b3524b27aae193aff768db12709be0d05/src/middleware.ts
      await walk(node, (node) => {
        removeDoctypePreamble(node)
        removeExcerptDelimiters(node)

        if (node.type === ELEMENT_NODE) {
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
        'data-language': ['*'],
        style: ['*'],
      },
      dropElements: ['link', 'script', 'style'],
    }),
  ])

  // Strips empty attributes with no name if any.
  return content.replaceAll(/\s=""\s/g, ' ')
}

export async function transformHTMLForMetrics(html: string) {
  let images = 0

  const content = await transform(html, [
    async (node) => {
      await walk(node, (node) => {
        removeDoctypePreamble(node)
        removeExcerptDelimiters(node)

        if (node.type === ELEMENT_NODE) {
          // Remove code blocks.
          if (node.name === 'div' && node.attributes['class']?.includes('expressive-code')) {
            removeHTMLNode(node)
          }
          // Count images.
          if (node.name === 'img') {
            images++
          }
        }
      })

      return node
    },
    sanitize({ unblockElements: [] }),
  ])

  return { content, images }
}

function removeExcerptDelimiters(node: Node) {
  if (
    node.type === ELEMENT_NODE &&
    node.name === 'p' &&
    'hidden' in node.attributes &&
    node.children.length === 1 &&
    node.children[0]?.type === COMMENT_NODE &&
    node.children[0].value === ' excerpt '
  ) {
    removeHTMLNode(node)
  }
}

function removeDoctypePreamble(node: Node) {
  if (node.type === DOCTYPE_NODE) {
    removeHTMLNode(node)
  }
}

function removeHTMLNode(node: Node) {
  node.type = TEXT_NODE
  node.value = ''
}
