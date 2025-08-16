import type { Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class BlogPage extends BasePage {
  public override readonly page: Page

  constructor(page: Page) {
    super(page)

    this.page = page
  }

  goto(index?: number, locale?: string) {
    return this.page.goto(`/${locale ? `${locale}/` : ''}blog${index ? `/${index}` : ''}`)
  }

  get nextLink() {
    return this.page.getByRole('link', { name: 'Older Posts' })
  }

  get prevLink() {
    return this.page.getByRole('link', { name: 'Newer Posts' })
  }
}
