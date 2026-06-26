import { expect, test } from 'vitest'

import { stripMarkdown } from '../../../libs/markdown'

test('strips basic Markdown syntax', () => {
  const markdown = `# Title

   **Bold** and _italic_ text with [link](https://example.com).

   ![Alt text](image.png)

   - Item one
   - Item two

     Item two follow-up

   > Quote here
   >
   > Quote follow-up

   \`x < y\`

   \`\`\`ts
   const ok = a < b && b > c;
   \`\`\`

   <span>raw</span>`

  expect(stripMarkdown(markdown)).toMatchInlineSnapshot(`
    "Title

    Bold and italic text with link.

    Alt text

    Item one
    Item two

    Item two follow-up

    Quote here

    Quote follow-up

    x &lt; y

    const ok = a &lt; b &amp;&amp; b &gt; c;

    &lt;span&gt;raw&lt;/span&gt;"
  `)
})
