# starlight-blog

## 0.17.0

### Minor Changes

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.32.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The Starlight Blog plugin no longer [overrides](https://starlight.astro.build/guides/overriding-components/) the [`<Sidebar>` component](https://starlight.astro.build/reference/overrides/#sidebar). If you were manually rendering `starlight-blog/overrides/Sidebar.astro` in a custom override, you can now remove it.

- [#111](https://github.com/HiDeoo/starlight-blog/pull/111) [`144e6b2`](https://github.com/HiDeoo/starlight-blog/commit/144e6b2cad8ff011806f9b8d5bb7f609f7e8fc13) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a route data object accessible on Starlight pages using `Astro.locals.starlightBlog` containing information about all the blog posts in your project. This can be useful for example to create a widget that lists recent blog posts on your homepage.

  See the [“Route Data” guide](https://starlight-blog-docs.vercel.app/guides/route-data/) for more information.

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
