---
title: Configuration
description: An overview of all the configuration options supported by the Starlight Blog plugin.
---

The Starlight Blog plugin can be configured inside the `astro.config.mjs` configuration file of your project:

```js {11}
// astro.config.mjs
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightBlog({
          // Configuration options go here.
        }),
      ],
      title: 'My Docs',
    }),
  ],
})
```

## Plugin configuration

The Starlight Blog plugin accepts the following configuration options:

### `title`

**Type:** `string`  
**Default:** `'Blog'`

The title of the blog.

### `postCount`

**Type:** `number`  
**Default:** `5`

The number of blog posts to display per page in the blog post list.

### `recentPostCount`

**Type:** `number`  
**Default:** `10`

The number of recent blog posts to display in the blog sidebar.

### `authors`

**Type:** [`StarlightBlogAuthorsConfig`](#author-configuration)

A list of global authors for all blog posts or regular authors that can be referenced in individual blog posts.
Check the ["Authors" guide](/guides/authors) section for more informations.

### `prevNextLinksOrder`

**Type:** `'chronological' | 'reverse-chronological'`  
**Default:** `'reverse-chronological'`

The order of the previous and next links in the blog.

By default, next links will point to the next blog post towards the past (`'reverse-chronological'`).
Setting this option to `'chronological'` will make next links point to the next blog post towards the future.

## Author configuration

Global authors for all blog posts or regular authors that can be referenced in individual blog posts can be defined using the [`authors`](#authors) configuration option.
When a blog post frontmatter does not define an author, the global authors from the configuration will be used instead.
Check the ["Authors" guide](/guides/authors) for more informations.

```js {4-9}
// astro.config.mjs
starlightBlog({
  authors: {
    alice: {
      // Author configuration for the `alice` author goes here.
    },
    bob: {
      // Author configuration for the `bob` author goes here.
    },
  },
})
```

An author can be configured using the following options:

### `name` (required)

**Type:** `string`

The name of the author.

### `title`

**Type:** `string`

A title to display below the author's name.

### `url`

**Type:** `string`

A URL to link the author's name to.

### `picture`

**Type:** `string`

A URL or path to an image in the `public/` directory to display as the author's picture.
