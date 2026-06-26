import { markdownToMdast, type MdastNode } from 'satteri'

const excerptKeyword = 'excerpt'

export const MdxExcerptDelimiter = `/* ${excerptKeyword} */`
export const MarkdownExcerptDelimiter = `<!-- ${excerptKeyword} -->`
export const HtmlExcerptDelimiter = `<p hidden><!-- ${excerptKeyword} --></p>`

const trailingLineWhitespacesRegex = /[ \t]+\n/g
const htmlEscapeRegex = /[&<>"']/g

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function stripMarkdown(markdown: string) {
  const tree = markdownToMdast(markdown, { features: { frontmatter: false, gfm: true } })
  return normalizePlaintext(stripNode(tree))
}

function stripNode(node: MdastNode): string {
  // https://satteri.bruits.org/docs/plugin-api/#supported-visitor-keys
  switch (node.type) {
    case 'root':
    case 'blockquote':
    case 'listItem': {
      return stripBlocks(node.children)
    }
    case 'paragraph':
    case 'heading':
    case 'emphasis':
    case 'strong':
    case 'link':
    case 'linkReference':
    case 'delete': {
      return stripInlines(node.children)
    }
    case 'thematicBreak':
    case 'definition':
    case 'footnoteDefinition':
    case 'footnoteReference': {
      return ''
    }
    case 'list': {
      return stripBlocks(node.children, '\n')
    }
    case 'html':
    case 'code':
    case 'inlineCode': {
      return escapeHtmlText(node.value)
    }
    case 'text': {
      return node.value
    }
    case 'break': {
      return '\n'
    }
    case 'image': {
      return node.alt ?? ''
    }
    case 'imageReference': {
      return node.alt ?? node.label ?? ''
    }
    case 'table': {
      return stripTable(node)
    }
    case 'tableRow': {
      return stripBlocks(node.children)
    }
    case 'tableCell': {
      return stripInlines(node.children)
    }

    default: {
      if ('children' in node && Array.isArray(node.children)) {
        return stripInlines(node.children)
      } else if ('value' in node && typeof node.value === 'string') {
        return node.value
      } else {
        return ''
      }
    }
  }
}

function stripBlocks(nodes: readonly MdastNode[], separator = '\n\n'): string {
  let result = ''

  for (const node of nodes) {
    const text = stripNode(node).trim()
    if (!text) continue
    if (result) result += separator
    result += text
  }

  return result
}

function stripInlines(nodes: readonly MdastNode[]): string {
  let result = ''

  for (const node of nodes) {
    result += stripNode(node)
  }

  return result
}

function stripTable(table: Extract<MdastNode, { type: 'table' }>): string {
  const [header, ...rows] = table.children
  if (!header) return ''

  const headers = header.children.map((cell) => stripNode(cell).trim())

  let result = ''

  for (const row of rows) {
    for (let index = 0; index < row.children.length; index++) {
      const cell = row.children[index]
      if (!cell) continue

      const value = stripNode(cell).trim()
      if (!value) continue

      if (result) result += '\n'

      result += headers[index] ? `${headers[index]}: ${value}` : value
    }
  }

  return result
}

function normalizePlaintext(text: string): string {
  return text.replaceAll(trailingLineWhitespacesRegex, '\n').trim()
}

function escapeHtmlText(value: string): string {
  return value.replaceAll(htmlEscapeRegex, (character) => htmlEscapes[character] ?? character)
}
