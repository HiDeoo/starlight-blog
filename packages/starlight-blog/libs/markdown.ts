import { Marked } from 'marked'
import markedPlaintify from 'marked-plaintify'
import { html, transform } from 'ultrahtml'
import sanitize from 'ultrahtml/transformers/sanitize'
import swap from 'ultrahtml/transformers/swap'

const markedMd = new Marked({ gfm: true })
const markedText = new Marked({ gfm: true }, markedPlaintify())

const importRegex = /^import\s.+?from\s.+?;?$/gm

const imagePlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjUwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNCM0IwQjBGRiI+PC9yZWN0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI1cHgiIGZpbGw9IiMyNjI2MjZGRiI+SW1hZ2U8L3RleHQ+ICAgCjwvc3ZnPg=='

export async function stripMarkdown(markdown: string) {
  return await markedText.parse(markdown)
}

export async function renderMarkdownToHTML(markdown: string, link: URL, imageFallbackLabel: string) {
  const sanitizedMarkdown = markdown.replaceAll(importRegex, '')
  const content = await markedMd.parse(sanitizedMarkdown)

  return transform(content, [
    swap({
      // Strip images from the content and replace them with a placeholder.
      // Re-evaluate this when the Container API is available in Astro.
      img: (props) =>
        html`<a href="${link}">
            <div><img src="${imagePlaceholder}" alt="${props['alt']}" /></div>
            <blockquote><em>${imageFallbackLabel}</em></blockquote>
          </a>
          <br />`,
    }),
    sanitize(),
  ])
}
