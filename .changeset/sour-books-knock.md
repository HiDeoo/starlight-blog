---
'starlight-blog': minor
---

Uses [Starlight’s built-in support for internationalization](https://starlight.astro.build/guides/i18n/#using-ui-translations) powered by [i18next](https://www.i18next.com/) to render blog post creation and update dates.

This change allows for more flexibility in formatting and translating these dates, including the ability to use different formats for different locales.

The `starlightBlog.post.date` string has been added to the list of UI strings provided by the plugin and the existing `starlightBlog.post.lastUpdate` string has been updated.
