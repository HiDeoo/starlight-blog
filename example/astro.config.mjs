import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
  integrations: [
    starlightBlog({
      authors: {
        hideoo: { name: 'HiDeoo', title: 'Starlight Aficionado', picture: '/hideoo.png', url: 'https://hideoo.dev' },
      },
    }),
    starlight({
      components: {
        MarkdownContent: 'starlight-blog/overrides/MarkdownContent.astro',
        Sidebar: 'starlight-blog/overrides/Sidebar.astro',
        ThemeSelect: 'starlight-blog/overrides/ThemeSelect.astro',
      },
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-blog/edit/main/example/',
      },
      sidebar: [
        { label: 'Getting Started', link: '/guides/getting-started/' },
        { label: 'Authors', link: '/guides/authors/' },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-blog',
      },
      title: 'Starlight Blog',
    }),
  ],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
