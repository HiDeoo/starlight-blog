import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
  integrations: [
    starlight({
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-blog/edit/main/example/',
      },
      plugins: [
        starlightBlog({
          authors: {
            hideoo: {
              name: 'HiDeoo',
              title: 'Starlight Aficionado',
              picture: '/hideoo.png',
              url: 'https://hideoo.dev',
            },
          },
        }),
      ],
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
})
