import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class PostPage extends BasePage {
  public override readonly page: Page

  constructor(page: Page) {
    super(page)

    this.page = page
  }

  goto(slug: string, locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog/${slug}`)
  }

  get nextLink() {
    return this.page.locator('css=[rel="next"]')
  }

  get prevLink() {
    return this.page.locator('css=[rel="prev"]')
  }
}
