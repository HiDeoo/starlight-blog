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

**Type:** `string | Record<string, string>`  
**Default:** `'Blog'`

The title of the blog.

The value can be a string, or for multilingual sites, an object with values for each different locale.
When using the object form, the keys must be BCP-47 tags (e.g. `en`, `fr`, or `zh-CN`):

```js {3-4}
starlightBlog({
  title: {
    en: 'My Blog',
    fr: 'Mon Blog',
  },
})
```

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
Check the ["Authors" guide](/guides/authors) for more informations.

### `prevNextLinksOrder`

**Type:** `'chronological' | 'reverse-chronological'`  
**Default:** `'reverse-chronological'`

The order of the previous and next links in the blog.

By default, next links will point to the next blog post towards the past (`'reverse-chronological'`).
Setting this option to `'chronological'` will make next links point to the next blog post towards the future.

### `prefix`

**Type:** `string`  
**Default:** `'blog'`

The base prefix for all blog routes.

By default, the blog will be available at `/blog` and blog posts at `/blog/example-post`.
Setting this option to `'news'` will make the blog available at `/news` and blog posts at `/news/example-post`.

### `navigation`

**Type:** `'header-start' | 'header-end' | 'none'`  
**Default:** `'header-end'`

The type of navigation links to the blog to display on a page.

- `header-start` — Adds a link to the blog after the site title or logo in the header on large viewports. On smaller viewports, a link to the blog is added to the mobile menu sidebar for non-blog pages. When using this option, the Starlight [`<SiteTitle>`](https://starlight.astro.build/reference/overrides/#sitetitle) will be [overridden](https://starlight.astro.build/guides/overriding-components/).
- `header-end` — Adds a link to the blog before the theme switcher in the header on large viewports. On smaller viewports, a link to the blog is added to the mobile menu sidebar for non-blog pages. When using this option, the Starlight [`<ThemeSelect>`](https://starlight.astro.build/reference/overrides/#themeselect) will be [overridden](https://starlight.astro.build/guides/overriding-components/).
- `none` — Does not add any links to the blog and it is up to the user to add links to the blog wherever they want.

### `metrics`

**Type:** [`StarlightBlogMetricsConfig`](#metrics-configuration)

The configuration of various metrics that can be displayed alongside blog posts, such as an estimated reading time or a word count.
Check the ["Metrics" guide](/guides/metrics) for more informations.

## Author configuration

Global authors for all blog posts or regular authors that can be referenced in individual blog posts can be defined using the [`authors`](#authors) configuration option.
When a blog post frontmatter does not define an author, the global authors from the configuration will be used instead.
Check the ["Authors" guide](/guides/authors) for more informations.

```js {3-8}
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

### `name`

**Required**  
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
When using remote images, check out the [“Authorizing remote images”](https://docs.astro.build/en/guides/images/#authorizing-remote-images) guide to enable image optimization.

## Metrics configuration

Configure metrics that can be displayed alongside blog posts.
Check the ["Metrics" guide](/guides/metrics) for more informations.

### `readingTime`

**Type:** `boolean`  
**Default:** `false`

Controls whether or not the estimated reading time of blog posts are displayed.
The estimated reading time is displayed in minutes, rounded up to the nearest minute.

See the ["Metrics" guide](/guides/metrics/#about-metrics) for more informations on how the estimated reading time is calculated.

### `words`

**Type:** `false | 'total' | 'rounded'`  
**Default:** `false`

Controls whether or not the word count of blog posts are displayed.

- `false` — Do not display the word count.
- `'total'` — Display the total word count of the blog post.
- `'rounded'` — Display the word count of the blog post rounded up to the nearest multiple of 100.

See the ["Metrics" guide](/guides/metrics/#about-metrics) for more informations on how the word count is computed.
