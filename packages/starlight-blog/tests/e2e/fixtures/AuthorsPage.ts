import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AuthorsPage extends BasePage {
  public override readonly page: Page

  constructor(page: Page) {
    super(page)

    this.page = page
  }

  goto(author: string, locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog/authors/${author}`)
  }
}
