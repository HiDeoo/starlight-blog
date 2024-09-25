import { test as base } from '@playwright/test'

import { AuthorsPage } from './fixtures/AuthorsPage'
import { BlogPage } from './fixtures/BlogPage'
import { PostPage } from './fixtures/PostPage'
import { TagsPage } from './fixtures/TagsPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  authorsPage: async ({ page }, use) => {
    const authorsPage = new AuthorsPage(page)

    await use(authorsPage)
  },
  blogPage: async ({ page }, use) => {
    const blogPage = new BlogPage(page)

    await use(blogPage)
  },
  postPage: async ({ page }, use) => {
    const postPage = new PostPage(page)

    await use(postPage)
  },
  tagsPage: async ({ page }, use) => {
    const tagsPage = new TagsPage(page)

    await use(tagsPage)
  },
})

interface Fixtures {
  authorsPage: AuthorsPage
  blogPage: BlogPage
  postPage: PostPage
  tagsPage: TagsPage
}
