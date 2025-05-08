// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
  integrations: [
    starlight({
      description: 'Starlight plugin to add a blog to your documentation.',
      locales: {
        root: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr' },
      },
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/starlight-blog/edit/main/docs/',
      },
      plugins: [
        starlightBlog({
          title: {
            en: 'Demo Blog',
            fr: 'Blog Démo',
          },
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
          items: ['getting-started', 'configuration'],
        },
        {
          label: 'Guides',
          items: [
            'guides/frontmatter',
            'guides/authors',
            'guides/excerpts',
            'guides/i18n',
            'guides/rss',
            'guides/blog-data',
          ],
        },
        {
          label: 'Resources',
          items: ['resources/showcase', { label: 'Plugins and Tools', slug: 'resources/starlight' }],
        },
        { label: 'Demo', link: '/blog/' },
      ],
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/starlight-blog', icon: 'github', label: 'GitHub' },
      ],
      title: 'Starlight Blog',
    }),
  ],
  image: {
    domains: ['avatars.githubusercontent.com'],
  },
  site: 'https://starlight-blog-docs.vercel.app',
})
