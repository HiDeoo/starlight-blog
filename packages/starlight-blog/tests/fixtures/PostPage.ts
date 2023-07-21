import type { Page } from '@playwright/test'

export class PostPage {
  constructor(public readonly page: Page) {}

  goto(slug: string) {
    return this.page.goto(`/blog/${slug}`)
  }
}
