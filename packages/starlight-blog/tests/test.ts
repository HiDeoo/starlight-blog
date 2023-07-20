import { test as base } from '@playwright/test'

import { BlogPage } from './fixtures/BlogPage'

export { expect } from '@playwright/test'

export const test = base.extend<Fixtures>({
  blogPage: async ({ page }, use) => {
    const docPage = new BlogPage(page)

    await use(docPage)
  },
})

interface Fixtures {
  blogPage: BlogPage
}
