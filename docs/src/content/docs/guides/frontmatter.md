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
