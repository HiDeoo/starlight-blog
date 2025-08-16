import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class TagsPage extends BasePage {
  public override readonly page: Page

  constructor(page: Page) {
    super(page)

    this.page = page
  }

  goto(tag: string, locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog/tags/${tag}`)
  }
}
