import type { Comment, Element, Node as HastNode, Root } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import { toString } from 'hast-util-to-string'
import { is } from 'unist-util-is'
import { remove } from 'unist-util-remove'

import { stripTrailingSlash } from './path'

export function transformHTMLForRSS(html: string, baseURL: URL) {
  const ast = fromHtml(html)

  remove(ast, (node) => {
    // Transform link with relative path to absolute URL.
    if (isElement(node, 'a') && isStringAttribute(node, 'href') && node.properties['href'].startsWith('/')) {
      node.properties['href'] = stripTrailingSlash(baseURL.href) + node.properties['href']
    }

    // Transform image with relative path to absolute URL.
    if (isElement(node, 'img') && isStringAttribute(node, 'src') && node.properties['src'].startsWith('/')) {
      node.properties['src'] = stripTrailingSlash(baseURL.href) + node.properties['src']
    }

    // Removals based on class names and attributes should be done before cleaning up some attributes.
    if (
      // Remove screen reader only accessibility text.
      hasCssClass(node, 'sr-only') ||
      // Remove aside icons.
      hasCssClass(node, 'starlight-aside__icon') ||
      // Remove Starlight section anchor links.
      hasCssClass(node, 'sl-anchor-link')
    ) {
      return true
    }

    // Remove irrelevant attributes.
    removeAttribute(node, 'style')
    removeAttribute(node, 'className')
    removeAttribute(node, 'dataAstroSourceFile')
    removeAttribute(node, 'dataAstroSourceLoc')
    removeAttribute(node, 'dataLanguage')

    return (
      // Remove excerpt delimiters.
      isExcerpt(node) ||
      // Remove link, script, and style elements.
      isElement(node, 'link') ||
      isElement(node, 'script') ||
      isElement(node, 'style') ||
      // Remove Expressive Code copy button.
      hasAttribute(node, 'dataCode')
    )
  })

  return toHtml(getBodyChildren(ast))
}

export function transformHTMLForMetrics(html: string) {
  let images = 0

  const ast = fromHtml(html)

  remove(ast, (node) => {
    // Count images.
    if (isElementNode(node) && node.tagName === 'img') images++

    return (
      // Remove screen reader only accessibility text.
      hasCssClass(node, 'sr-only') ||
      // Remove code blocks.
      hasCssClass(node, 'expressive-code')
    )
  })

  return { content: toString(ast), images }
}

function getBodyChildren(ast: Root) {
  const html = ast.children[0]
  if (!html || !isElement(html, 'html')) return ast

  const body = html.children.find((child) => isElement(child, 'body'))

  return body?.children ?? ast
}

function isElementNode(node: HastNode): node is Element {
  return is(node, { type: 'element' })
}

function isCommentNode(node: HastNode | undefined): node is Comment {
  return is(node, { type: 'comment' })
}

function isElement(node: HastNode, tagName: string): node is Element {
  return isElementNode(node) && node.tagName === tagName
}

function isStringAttribute<T extends string>(
  node: Element,
  attribute: T,
): node is Element & { properties: Record<T, string> } {
  return typeof node.properties[attribute] === 'string'
}

function hasCssClass(node: HastNode, className: string): boolean {
  return (
    isElementNode(node) &&
    Array.isArray(node.properties['className']) &&
    node.properties['className'].includes(className)
  )
}

function hasAttribute(node: HastNode, attribute: string): boolean {
  return isElementNode(node) && attribute in node.properties
}

function removeAttribute(node: HastNode, attribute: string) {
  if (isElementNode(node) && attribute in node.properties) node.properties[attribute] = undefined
}

function isExcerpt(node: HastNode): boolean {
  return (
    isElement(node, 'p') &&
    node.children.length === 1 &&
    isCommentNode(node.children[0]) &&
    node.children[0].value.trim() === 'excerpt'
  )
}
