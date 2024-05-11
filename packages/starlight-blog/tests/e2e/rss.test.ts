import { expect, test } from './test'

test('should add a Starlight social link to the RSS feed', async ({ blogPage }) => {
  await blogPage.goto()

  await expect(blogPage.page.getByRole('banner').getByRole('link', { name: 'RSS' })).toBeVisible()
})
