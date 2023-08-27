<div align="center">
  <h1>starlight-blog 📰</h1>
  <p>Astro integration for Starlight to add a blog to your documentation.</p>
  <p>
    <a href="https://i.imgur.com/5Q8Vlhn.png" title="Screenshot of starlight-blog">
      <img alt="Screenshot of starlight-blog" src="https://i.imgur.com/5Q8Vlhn.png" width="520" />
    </a>
  </p>
</div>

<div align="center">
  <a href="https://github.com/HiDeoo/starlight-blog/actions/workflows/integration.yml">
    <img alt="Integration Status" src="https://github.com/HiDeoo/starlight-blog/actions/workflows/integration.yml/badge.svg" />
  </a>
  <a href="https://github.com/HiDeoo/starlight-blog/blob/main/LICENSE">
    <img alt="License" src="https://badgen.net/github/license/HiDeoo/starlight-blog" />
  </a>
  <br />
</div>

## Features

An [Astro](https://astro.build) integration for [Starlight](https://starlight.astro.build) to add a blog to your documentation website.

- Link to the blog in the header
- Post list with pagination
- Global and per-post authors
- Tags
- Custom sidebar with recent posts and tags

> **Warning**
>
> The Starlight Blog integration is still in early development and relies on fragile APIs to customize Starlight.

Some features are still missing and will be added in the future like internationalization, feeds, reading time, etc.

## Installation

Install the Starlight Blog integration using your favorite package manager, e.g. with [pnpm](https://pnpm.io):

```shell
pnpm add starlight-blog
```

Update your [Astro configuration](https://docs.astro.build/en/guides/configuring-astro/#supported-config-file-types) to include the Starlight Blog integration **_before_** the Starlight integration:

```diff
  import starlight from '@astrojs/starlight'
  import { defineConfig } from 'astro/config'
+ import starlightBlog from 'starlight-blog'

  export default defineConfig({
    // …
    integrations: [
+     starlightBlog(),
      starlight({
        sidebar: [
          {
            label: 'Guides',
            items: [{ label: 'Example Guide', link: '/guides/example/' }],
          },
        ],
        title: 'My Docs',
      }),
    ],
  })
```

Update the Starlight Content Collections configuration in `src/content/config.ts` to use a new schema supporting blog posts:

```diff
  import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
  import { defineCollection } from 'astro:content'
+ import { docsAndBlogSchema } from 'starlight-blog/schema'

  export const collections = {
-   docs: defineCollection({ schema: docsSchema() }),
+   docs: defineCollection({ schema: docsAndBlogSchema }),
    i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  }
```

Create your first blog post by creating a `.md` or `.mdx` file in the `src/content/docs/blog/` directory:

```md
---
title: My first blog post
date: 2023-07-24
---

## Hello

Hello world!
```

## Configuration

You can pass the following options to the Starlight Blog integration:

| Name              | Description                                                                            | Default |
| ----------------- | -------------------------------------------------------------------------------------- | :-----: |
| `authors`         | A list of global authors. Check the [authors](#authors) section for more informations. |   {}    |
| `postCount`       | The number of blog posts to display per page in the blog post list.                    |    5    |
| `recentPostCount` | The number of recent blog posts to display in the sidebar.                             |   10    |
| `title`           | The title of the blog.                                                                 | 'Blog'  |

## Frontmatter

Individual blog posts can be customized using their [frontmatter](https://astro.build/docs/content#frontmatter). A blog post must at least have a `title` and a `date` (posts are sorted by descending date) property:

```md
---
title: Documentation 101
date: 2023-07-24
---

Let's learn how to write documentation!
```

| Name      | Description                                                                                                                             | Required |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `authors` | The author(s) of the blog post. Check the [authors](#authors) section for more informations.                                            |          |
| `date`    | The date of the blog post which must be a valid [YAML timestamp](https://yaml.org/type/timestamp.html).                                 |    ✅    |
| `excerpt` | The excerpt of the blog post used in the blog post list and tags pages. If not provided, the entire blog post content will be rendered. |          |
| `tags`    | A list of tags associated with the blog post.                                                                                           |          |

## Authors

Authors can be defined in a blog post using the `authors` frontmatter property and must at least have a `name` property:

```yaml
authors:
  name: HiDeoo
  title: Starlight Legend
  picture: https://avatars.githubusercontent.com/u/494699
  url: https://hideoo.dev
```

Multiple authors can be defined using an array:

```yaml
authors:
  - name: HiDeoo
    title: Starlight Legend
    picture: https://avatars.githubusercontent.com/u/494699
    url: https://hideoo.dev
  - name: Ghost
    picture: https://avatars.githubusercontent.com/u/10137
    url: https://github.com/ghost
```

Regular authors can also be defined globally in the Starlight Blog integration configuration:

```ts
starlightBlog({
  authors: {
    hideoo: {
      name: 'HiDeoo',
      title: 'Starlight Legend',
      picture: '/hideoo.png', // Images in the `public` directory are supported.
      url: 'https://hideoo.dev',
    },
  },
})
```

When a blog post frontmatter does not define an author, the global authors from the configuration will be used instead.

A blog post frontmatter can also reference a global author using the key of the author in the configuration:

```yaml
authors:
  - hideoo # Will use the author defined in the configuration with the `hideoo` key.
  - name: Ghost
    picture: https://avatars.githubusercontent.com/u/10137
    url: https://github.com/ghost
```

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/starlight-blog/blob/main/LICENSE) for more information.
