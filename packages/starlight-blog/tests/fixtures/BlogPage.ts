import type { Page } from '@playwright/test'

export class BlogPage {
  constructor(public readonly page: Page) {}

  goto(index?: number) {
    return this.page.goto(`/blog${index ? `/${index}` : ''}`)
  }
}
