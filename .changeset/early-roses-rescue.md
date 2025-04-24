---
'starlight-blog': minor
---

Adds a new [`navigation`](https://starlight-blog-docs.vercel.app/configuration/#navigation) option to the blog configuration to control the type of navigation links to the blog to display on a page.

The current behavior (`header-end`) to add a link to the blog before the theme switcher in the header on large viewports and a link to the mobile menu sidebar for non-blog pages on smaller viewports remains unchanged. Two new behaviors are now available:

- `header-start` — Adds a link to the blog after the site title or logo in the header on large viewports. On smaller viewports, a link to the blog is added to the mobile menu sidebar for non-blog pages.
- `none` — Does not add any links to the blog and it is up to the user to add links to the blog wherever they want.
