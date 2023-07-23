import type { Page } from '@playwright/test'

export class PostPage {
  constructor(public readonly page: Page) {}

  goto(slug: string) {
    return this.page.goto(`/blog/${slug}`)
  }

  get nextLink() {
    return this.page.locator('css=[rel="next"]')
  }

  get prevLink() {
    return this.page.locator('css=[rel="prev"]')
  }
}
