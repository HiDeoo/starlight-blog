import { Marked } from 'marked'
import markedPlaintify from 'marked-plaintify'
import { transform } from 'ultrahtml'
import sanitize from 'ultrahtml/transformers/sanitize'

const markedMd = new Marked({ gfm: true })
const markedText = new Marked({ gfm: true }, markedPlaintify())

export async function stripMarkdown(markdown: string) {
  return await markedText.parse(markdown)
}

export async function renderMarkdownToHTML(markdown: string) {
  const content = await markedMd.parse(markdown)

  return transform(content, [sanitize()])
}
