import type { Page } from '@playwright/test'

export class TagsPage {
  constructor(public readonly page: Page) {}

  goto(tag: string) {
    return this.page.goto(`/blog/tags/${tag}`)
  }
}
