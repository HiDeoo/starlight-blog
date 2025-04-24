# starlight-blog

## 0.21.0

### Minor Changes

- [#139](https://github.com/HiDeoo/starlight-blog/pull/139) [`6ed1559`](https://github.com/HiDeoo/starlight-blog/commit/6ed15599bf075feeac4165e57d56b86967d72ad2) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Displays cover images for blog posts in pages that list blog posts such as the blog index page.

- [#139](https://github.com/HiDeoo/starlight-blog/pull/139) [`6ed1559`](https://github.com/HiDeoo/starlight-blog/commit/6ed15599bf075feeac4165e57d56b86967d72ad2) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`navigation`](https://starlight-blog-docs.vercel.app/configuration/#navigation) option to the blog configuration to control the type of navigation links to the blog to display on a page.

  The current behavior (`header-end`) to add a link to the blog before the theme switcher in the header on large viewports and a link to the mobile menu sidebar for non-blog pages on smaller viewports remains unchanged. Two new behaviors are now available:

  - `header-start` — Adds a link to the blog after the site title or logo in the header on large viewports. On smaller viewports, a link to the blog is added to the mobile menu sidebar for non-blog pages.
  - `none` — Does not add any links to the blog and it is up to the user to add links to the blog wherever they want.

### Patch Changes

- [#139](https://github.com/HiDeoo/starlight-blog/pull/139) [`6ed1559`](https://github.com/HiDeoo/starlight-blog/commit/6ed15599bf075feeac4165e57d56b86967d72ad2) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an inconsistency in blog post ordering for posts with the same date.

  Blog posts are now consistently ordered by their [`date`](https://starlight-blog-docs.vercel.app/guides/frontmatter/#date-required) in descending order, and then by their [`title`](https://starlight-blog-docs.vercel.app/guides/frontmatter/#title-required) in ascending order if the dates are identical.

## 0.20.0

### Minor Changes

- [#131](https://github.com/HiDeoo/starlight-blog/pull/131) [`32d0fdd`](https://github.com/HiDeoo/starlight-blog/commit/32d0fddf2ee01410e9c830de37209648f35de99d) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.33.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

## 0.19.0

### Minor Changes

- [#128](https://github.com/HiDeoo/starlight-blog/pull/128) [`047cc90`](https://github.com/HiDeoo/starlight-blog/commit/047cc9050452779a0faf0319ecfadd24510617fb) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Exposes the [cover image](https://starlight-blog-docs.vercel.app/guides/blog-data/#cover) and [Astro content collection entry](https://starlight-blog-docs.vercel.app/guides/blog-dat/#entry) of blog posts in the blog data object accessible on Starlight pages.

  See the [“Blog Data” guide](https://starlight-blog-docs.vercel.app/guides/blog-data/) for more information.

## 0.18.0

### Minor Changes

- [#122](https://github.com/HiDeoo/starlight-blog/pull/122) [`75dee60`](https://github.com/HiDeoo/starlight-blog/commit/75dee601d9914a57269ba942b0332db04658ebdc) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Respects Starlight convention to generate URLs with a trailing slash when using the [`trailingSlash: 'ignore'`](https://docs.astro.build/en/reference/configuration-reference/#trailingslash) Astro configuration option (the default) as many common hosting providers redirect to URLs with a trailing slash by default.

## 0.17.3

### Patch Changes

- [#120](https://github.com/HiDeoo/starlight-blog/pull/120) [`24172db`](https://github.com/HiDeoo/starlight-blog/commit/24172dbe1b36442f982b86a5d3588749eb906658) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a potential build issue for blogs with more than 20 posts also generating an RSS feed.

## 0.17.2

### Patch Changes

- [#115](https://github.com/HiDeoo/starlight-blog/pull/115) [`90da130`](https://github.com/HiDeoo/starlight-blog/commit/90da130940fc3b918f66a7cb0c4a6b1d1ef2a033) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Improves build performance for large sites by adding a caching layer to blog entries and data.

## 0.17.1

### Patch Changes

- [#113](https://github.com/HiDeoo/starlight-blog/pull/113) [`b6f7122`](https://github.com/HiDeoo/starlight-blog/commit/b6f7122206a11eb737a614cf2a6daf119531e6db) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an issue where aside icons were not removed from RSS content.

## 0.17.0

### Minor Changes

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.32.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The Starlight Blog plugin no longer [overrides](https://starlight.astro.build/guides/overriding-components/) the [`<Sidebar>` component](https://starlight.astro.build/reference/overrides/#sidebar). If you were manually rendering `starlight-blog/overrides/Sidebar.astro` in a custom override, you can now remove it.

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a blog data object accessible on Starlight pages using `Astro.locals.starlightBlog` containing information about all the blog posts in your project. This can be useful for example to create a widget that lists recent blog posts on your homepage.

  See the [Blog Data” guide](https://starlight-blog-docs.vercel.app/guides/blog-data/) for more information.

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a regression introduced in version `0.16.0` of the plugin where the generated RSS feed no longer included content of blog posts due to a bug in Astro.

## 0.16.1

### Patch Changes

- [#105](https://github.com/HiDeoo/starlight-blog/pull/105) [`4ce050c`](https://github.com/HiDeoo/starlight-blog/commit/4ce050c9e6317d2cb3b7329e84aa9b0a5aa02cb5) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for passing [`Infinity`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity) to the [`postCount`](https://starlight-blog-docs.vercel.app/configuration#postcount) and [`recentPostCount`](https://starlight-blog-docs.vercel.app/configuration#recentpostcount) configuration options.

## 0.16.0

### Minor Changes

- [#100](https://github.com/HiDeoo/starlight-blog/pull/100) [`679e509`](https://github.com/HiDeoo/starlight-blog/commit/679e50998bad26034735c99302de5645dd87bf6e) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v5, drops support for Astro v4.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now `0.30.0`.

  Please follow the [upgrade guide](https://github.com/withastro/starlight/releases/tag/%40astrojs/starlight%400.30.0) to update your project.

  Note that the [`legacy.collections` flag](https://docs.astro.build/en/reference/legacy-flags/#collections) is not supported by this plugin and you should update your collections to use Astro's new Content Layer API.

  ⚠️ **BREAKING CHANGE:** The generated RSS feed no longer includes content of blog posts due to a [regression](https://github.com/withastro/astro/issues/12669) in Astro v5. The feature will be restored in a future release. If you rely on this feature, please stay on a previous version of Starlight and Astro in the meantime.
