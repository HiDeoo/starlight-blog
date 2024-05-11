---
title: RSS
description: Learn how to configure the RSS feed for your blog.
---

Starlight Blog automatically generates an RSS feed for your blog when the Astro [`site`](https://docs.astro.build/en/reference/configuration-reference/#site) option is set.
When defined, the following changes are made:

- An RSS feed is generated at `/blog/rss.xml` (can be customized with the [`prefix`](/configuration/#prefix) option)
- A sidebar link to the RSS feed is added to the blog
- A [social link](https://starlight.astro.build/reference/configuration/#social) to the RSS feed is added to the Starlight header
- [RSS feed auto-discovery](https://docs.astro.build/en/guides/rss/#enabling-rss-feed-auto-discovery) is automatically configured

## Configure your RSS feed

Set the Astro [`site`](https://docs.astro.build/en/reference/configuration-reference/#site) configuration option in the `astro.config.mjs` file.

```diff lang=js title="astro.config.mjs"
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightBlog from 'starlight-blog'

export default defineConfig({
+  site: 'https://www.example.com'
  starlight({
    social: {
      plugins: [starlightBlog()],
      title: 'My Docs',
    },
  }),
})
```

This will create a `.xml` file for feed readers, add a sidebar link to the RSS feed, add the standard RSS icon to your website's header and configure RSS feed auto-discovery.
