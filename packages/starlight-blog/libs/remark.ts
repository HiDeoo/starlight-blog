import 'mdast-util-mdx-expression'

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import { CONTINUE, EXIT, visit } from 'unist-util-visit'

const excerptKeyword = 'excerpt'
export const ExcerptDelimiter = `<p hidden><!-- ${excerptKeyword} --></p>`

export const remarkStarlightBlog: RemarkPlugin = function () {
  return function (tree) {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return CONTINUE

      if (
        (node.type === 'mdxFlowExpression' && node.value === `/* ${excerptKeyword} */`) ||
        (node.type === 'html' && node.value === `<!-- ${excerptKeyword} -->`)
      ) {
        parent.children.splice(index, 1, { type: 'html', value: ExcerptDelimiter })

        return EXIT
      }

      return CONTINUE
    })
  }
}
