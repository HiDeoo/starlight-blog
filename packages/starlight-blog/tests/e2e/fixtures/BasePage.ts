import type { Page } from '@playwright/test'

export abstract class BasePage {
  constructor(public readonly page: Page) {}

  get content() {
    return this.page.getByRole('main')
  }

  get sidebar() {
    return this.page.locator('nav.sidebar')
  }
}
