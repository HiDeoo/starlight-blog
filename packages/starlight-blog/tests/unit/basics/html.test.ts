import { describe, expect, test } from 'vitest'

import { transformHTMLForMetrics } from '../../../libs/html'

describe('transformHTMLForMetrics', () => {
  test('returns non-HTML content', () => {
    const content = `This is a test content without HTML tags.

It should return the same content without any modifications.`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toBe(content)
    expect(result.images).toBe(0)
  })

  test('strips HTML tags', () => {
    const content = `<p>This is a <strong>test</strong> content with <em>HTML</em> tags.</p>`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toBe('This is a test content with HTML tags.')
    expect(result.images).toBe(0)
  })

  test('strips excerpt delimiters', () => {
    const content = `Test content with excerpt delimiters.

<p hidden><!-- excerpt --></p>

Content after excerpt.`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toMatchInlineSnapshot(`
      "Test content with excerpt delimiters.



      Content after excerpt."
    `)
    expect(result.images).toBe(0)
  })

  test('removes code blocks', () => {
    const content = `This is a test content with a code block.

<div class="expressive-code">
Content of the code block.
</div>

And some more content after the code block.`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toMatchInlineSnapshot(`
      "This is a test content with a code block.



      And some more content after the code block."
    `)
    expect(result.images).toBe(0)
  })

  test('removes code blocks with markup-like content in HTML attributes', () => {
    const content = `This is a test content with a code block.

<div class="expressive-code">
  <figure class="frame not-content">
    <pre><code>test</code></pre>
    <button title="Copy to clipboard" data-copied="Copied!" data-code="> Option<test>"></button>
  </figure>
</div>

And some more content after the code block.`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toMatchInlineSnapshot(`
      "This is a test content with a code block.



      And some more content after the code block."
    `)
    expect(result.images).toBe(0)
  })

  test('counts images', () => {
    const content = `<p>This is a test content with an image.</p>

<img src="image.jpg" alt="Test Image" />

<p>And some more content after the image.</p>

And another image:

<img src="another-image.jpg" alt="Another Test Image" />`

    const result = transformHTMLForMetrics(content)

    expect(result.content).toMatchInlineSnapshot(`
      "This is a test content with an image.



      And some more content after the image.

      And another image:

      "
    `)
    expect(result.images).toBe(2)
  })
})
