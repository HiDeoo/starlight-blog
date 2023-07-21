import { test as base } from '@playwright/test'

import { BlogPage } from './fixtures/BlogPage'
import { PostPage } from './fixtures/PostPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  blogPage: async ({ page }, use) => {
    const blogPage = new BlogPage(page)

    await use(blogPage)
  },
  postPage: async ({ page }, use) => {
    const postPage = new PostPage(page)

    await use(postPage)
  },
})

interface Fixtures {
  blogPage: BlogPage
  postPage: PostPage
}
