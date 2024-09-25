import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class PostPage extends BasePage {
  constructor(public override readonly page: Page) {
    super(page)
  }

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
