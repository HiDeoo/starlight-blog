import { defineMdastPlugin } from 'satteri'

import { HtmlExcerptDelimiter, MarkdownExcerptDelimiter, MdxExcerptDelimiter } from './markdown'

export const satteriStarlightBlog = () => {
  return defineMdastPlugin({
    name: 'starlight-blog',
    html(node, ctx) {
      if (ctx.data.starlightBlogExcerptFound || node.value !== MarkdownExcerptDelimiter) return
      ctx.data.starlightBlogExcerptFound = true
      ctx.replaceNode(node, { type: 'html', value: HtmlExcerptDelimiter })
    },
    mdxFlowExpression(node, ctx) {
      if (ctx.data.starlightBlogExcerptFound || node.value !== MdxExcerptDelimiter) return
      ctx.data.starlightBlogExcerptFound = true
      ctx.replaceNode(node, { type: 'html', value: HtmlExcerptDelimiter })
    },
  })
}

declare module 'satteri' {
  interface DataMap {
    starlightBlogExcerptFound: boolean
  }
}
