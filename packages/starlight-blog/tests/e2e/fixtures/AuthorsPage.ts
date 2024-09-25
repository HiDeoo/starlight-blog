import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AuthorsPage extends BasePage {
  constructor(public override readonly page: Page) {
    super(page)
  }

  goto(author: string) {
    return this.page.goto(`/blog/authors/${author}`)
  }
}
