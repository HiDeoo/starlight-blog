import type { Page } from '@playwright/test'

export abstract class BasePage {
  public readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get content() {
    return this.page.getByRole('main')
  }

  get sidebar() {
    return this.page.locator('nav.sidebar')
  }
}
