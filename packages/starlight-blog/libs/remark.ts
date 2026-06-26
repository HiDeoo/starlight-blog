import 'mdast-util-mdx-expression'

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import { CONTINUE, EXIT, visit } from 'unist-util-visit'

import { HtmlExcerptDelimiter, MarkdownExcerptDelimiter, MdxExcerptDelimiter } from './markdown'

export const remarkStarlightBlog: RemarkPlugin = function () {
  return function (tree) {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return CONTINUE

      if (
        (node.type === 'mdxFlowExpression' && node.value === MdxExcerptDelimiter) ||
        (node.type === 'html' && node.value === MarkdownExcerptDelimiter)
      ) {
        parent.children.splice(index, 1, { type: 'html', value: HtmlExcerptDelimiter })

        return EXIT
      }

      return CONTINUE
    })
  }
}
