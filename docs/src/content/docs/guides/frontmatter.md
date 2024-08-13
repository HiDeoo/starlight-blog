---
title: Frontmatter
description: An overview of the default frontmatter fields supported by the Starlight Blog plugin.
---

You can customize individual blog posts by setting values in their frontmatter which is set at the top of your files between `---` separators:

```md {1-5}
---
// src/content/docs/blog/blog-post.md
title: My blog post
date: 2024-02-17
---

Blog post content…
```

## Frontmatter fields

### `title` (required)

**Type:** `string`

The title of the blog post which will be displayed at the top of the page and in the blog post list.

```md
---
title: A blog post
---
```

### `date` (required)

**Type:** `Date`

The date of the blog post which must be a valid [YAML timestamp](https://yaml.org/type/timestamp.html).
Posts are sorted by descending date in the blog post list.

```md
---
date: 2024-03-11
---
```

### `lastUpdated`

**Type:** `Date | boolean`

If a date is specified in a blog post for this [Starlight frontmatter field](https://starlight.astro.build/reference/frontmatter/#lastupdated), such date will also be displayed next to the blog post date.

Displayed only if different from the [`date`](#date-required) frontmatter field and must be a valid [YAML timestamp](https://yaml.org/type/timestamp.html).

```md
---
lastUpdated: 2024-07-01
---
```

### `tags`

**Type:** `string[]`

A list of tags associated with the blog post displayed at the bottom of a blog post and in the blog post list.

```md
---
tags:
  - Tag
  - Another tag
---
```

### `excerpt`

**Type:** `string`

The excerpt of the blog post used in the blog post list and tags pages.
If not provided, the entire blog post content will be rendered.

```md
---
excerpt: A small excerpt of the blog post…
---
```

### `authors`

**Type:** [`StarlightBlogAuthorsConfig`](/configuration#author-configuration)

The author(s) of the blog post. Check the ["Authors" guide](/guides/authors) for more informations.

```md
---
authors:
  - Bob
---
```

### `featured`

**Type:** `boolean`  
**Default:** `false`

Set whether this blog post should be considered featured.
Featured blog posts are listed at the top of the sidebar in a dedicated "Featured posts" group.

The featured group is displayed only if at least one blog post is marked as featured.
If a blog post is featured and also recent, it will be displayed only in the featured group.

```md
---
featured: true
---
```

### `draft`

**Type:** `boolean`  
**Default:** `false`

Set whether this blog post should be considered a draft and not be included in [production builds](https://docs.astro.build/en/reference/cli-reference/#astro-build).
Set to `true` to mark a blog post as a draft and make it only visible during development.

```md
---
draft: true
---
```

### `cover`

**Type:** [`CoverConfig`](#coverconfig)

Add a cover image to the top of the blog post.

```md
---
cover:
  alt: A beautiful cover image
  image: ../../../assets/cover.png
---
```

You can display different versions of the cover image in dark and light modes.

```md
---
cover:
  alt: Beautiful cover images
  dark: ../../../assets/cover-dark.png
  light: ../../../assets/cover-light.png
---
```

#### `CoverConfig`

```ts
type CoverConfig =
  | {
      // Alternative text describing the cover image for assistive technologies.
      alt: string
      // Relative path to an image file in your project.
      image: string
    }
  | {
      // Alternative text describing the cover image for assistive technologies.
      alt: string
      // Relative path to an image file in your project to use in dark mode.
      dark: string
      // Relative path to an image file in your project to use in light mode.
      light: string
    }
```
