---
'starlight-blog': patch
---

Fixes an inconsistency in blog post ordering for posts with the same date.

Blog posts are now consistently ordered by their [`date`](https://starlight-blog-docs.vercel.app/guides/frontmatter/#date-required) in descending order, and then by their [`title`](https://starlight-blog-docs.vercel.app/guides/frontmatter/#title-required) in ascending order if the dates are identical.
