import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class TagsPage extends BasePage {
  constructor(public override readonly page: Page) {
    super(page)
  }

  goto(tag: string, locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog/tags/${tag}`)
  }
}
