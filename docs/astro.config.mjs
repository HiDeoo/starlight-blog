import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-blog/edit/main/docs/',
      },
      plugins: [
        starlightBlog({
          title: 'Demo Blog',
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
        {
          label: 'Start Here',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Configuration', link: '/configuration/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Frontmatter', link: '/guides/frontmatter/' },
            { label: 'Authors', link: '/guides/authors/' },
            { label: 'RSS', link: '/guides/rss/' },
          ],
        },
        {
          label: 'Resources',
          items: [
            { label: 'Showcase', link: '/resources/showcase/' },
            { label: 'Plugins and Tools', link: '/resources/starlight/' },
          ],
        },
        { label: 'Demo', link: '/blog/' },
      ],
      social: {
        github: 'https://github.com/HiDeoo/starlight-blog',
      },
      title: 'Starlight Blog',
    }),
  ],
  image: {
    domains: ['avatars.githubusercontent.com'],
  },
  site: 'https://starlight-blog-docs.vercel.app',
})
