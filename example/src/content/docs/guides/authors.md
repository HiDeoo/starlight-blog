---
title: Getting Started
---

## Post authors

Authors can be defined in a blog post using the `authors` frontmatter property and must at least have a `name` property:

```yaml
authors:
  name: HiDeoo
  title: Starlight Legend
  picture: https://avatars.githubusercontent.com/u/494699
  url: https://hideoo.dev
```

Multiple authors can be defined using an array:

```yaml
authors:
  - name: HiDeoo
    title: Starlight Legend
    picture: https://avatars.githubusercontent.com/u/494699
    url: https://hideoo.dev
  - name: Ghost
    picture: https://avatars.githubusercontent.com/u/10137
    url: https://github.com/ghost
```

## Global authors

Regular authors can also be defined globally in the Starlight Blog integration configuration:

```ts
starlightBlog({
  authors: {
    hideoo: {
      name: 'HiDeoo',
      title: 'Starlight Legend',
      picture: '/hideoo.png', // Images in the `public` directory are supported.
      url: 'https://hideoo.dev',
    },
  },
})
```

When a blog post frontmatter does not define an author, the global authors from the configuration will be used instead.

A blog post frontmatter can also reference a global author using the key of the author in the configuration:

```yaml
authors:
  - hideoo # Will use the author defined in the configuration with the `hideoo` key.
  - name: Ghost
    picture: https://avatars.githubusercontent.com/u/10137
    url: https://github.com/ghost
```
