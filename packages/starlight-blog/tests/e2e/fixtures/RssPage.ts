import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class RssPage extends BasePage {
  public override readonly page: Page

  constructor(page: Page) {
    super(page)

    this.page = page
  }

  goto(locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog/rss.xml`)
  }

  async getAllContent() {
    const allTextContents = await this.page.locator("xpath=//*[name()='content:encoded']").allTextContents()
    return allTextContents.join(' ')
  }
}
