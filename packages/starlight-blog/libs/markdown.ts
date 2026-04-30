import { Marked } from 'marked'
import markedPlaintify from 'marked-plaintify'

const markedText = new Marked({ gfm: true }, markedPlaintify())

export async function stripMarkdown(markdown: string) {
  const text = await markedText.parse(markdown)
  return text.trim()
}
