import type { Page } from '@playwright/test'

export class BlogPage {
  constructor(public readonly page: Page) {}

  goto(index?: number) {
    return this.page.goto(`/blog${index ? `/${index}` : ''}`)
  }

  get nextLink() {
    return this.page.getByRole('link', { name: 'Older Posts' })
  }

  get prevLink() {
    return this.page.getByRole('link', { name: 'Newer Posts' })
  }
}
