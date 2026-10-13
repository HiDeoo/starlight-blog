import { expect, test } from './test'

test.describe('social link', () => {
  test('should add a Starlight social link to the RSS feed', async ({ blogPage }) => {
    await blogPage.goto()

    await expect(blogPage.page.getByRole('banner').getByRole('link', { name: 'RSS' })).toBeVisible()
  })
})

test.describe('feed', () => {
  test('should not contain doctype preamble', async ({ rssPage }) => {
    await rssPage.goto()

    expect(await rssPage.getAllContent()).not.toContain('DOCTYPE')
  })

  test('should not contain link with relative href', async ({ rssPage }) => {
    await rssPage.goto()

    expect(await rssPage.getAllContent()).not.toContain('a href="/')
  })

  test('should not contain image with relative src', async ({ rssPage }) => {
    await rssPage.goto()

    expect(await rssPage.getAllContent()).not.toContain('img src="/')
  })

  test('should not contain excerpt delimiters', async ({ rssPage }) => {
    await rssPage.goto()

    expect(await rssPage.getAllContent()).not.toContain('<!-- excerpt -->')
  })

  test('should not contain heading anchor links', async ({ rssPage }) => {
    await rssPage.goto()

    expect(await rssPage.getAllContent()).not.toContain('Section titled')
  })
})
