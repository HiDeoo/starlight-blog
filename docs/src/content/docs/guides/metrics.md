---
title: Metrics
description: Learn about metrics and how to configure them for your blog posts.
---

Starlight Blog can display various metrics alongside blog posts, such as an estimated reading time or a word count.

## Configure metrics

Metrics can be configured inside the `astro.config.mjs` configuration file of your project using the [`metrics` option](/configuration/#metrics-configuration) of the `starlightBlog` plugin.

Different metrics can be enabled or disabled:

- [`readingTime`](/configuration/#readingtime) — Controls whether or not the estimated reading time of blog posts are displayed.
- [`words`](/configuration/#words) — Controls whether or not the word count of blog posts are displayed.

```js {2-5}
starlightBlog({
  metrics: {
    readingTime: true,
    words: 'total',
  },
})
```

See the [Metrics configuration Reference](/configuration/#metrics-configuration) for all supported options.
Metrics can also be overridden on a per-blog post basis using the [`metrics` frontmatter](/guides/frontmatter/#metrics) property and is also accessible in [blog data](/guides/blog-data/#metrics).

## About metrics

Metrics are computed by the Starlight Blog plugin based on the content of blog posts with the following rules:

- Code blocks are ignored.
- Any markup is stripped from the content.

The word count is calculated using the [`Intl.Segmenter` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) taking into account the language of blog posts.

The estimated reading time is calculated based on the average reading speed of [213 words per minute](https://iovs.arvojournals.org/article.aspx?articleid=2166061). Images follow the [Medium reading time rules](https://blog.medium.com/read-time-and-you-bc2048ab620c) where the first image adds 12 seconds, the second image adds 11 seconds, and each subsequent image adds one less second until the tenth image, after which each additional image counts as 3 seconds.
