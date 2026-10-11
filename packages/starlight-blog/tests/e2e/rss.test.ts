import { expect, test } from './test'

test.describe('social link', () => {
  test('should add a Starlight social link to the RSS feed', async ({ blogPage }) => {
    await blogPage.goto()

    await expect(blogPage.page.getByRole('banner').getByRole('link', { name: 'RSS' })).toBeVisible()
  })
})

test.describe('feed', () => {
  test('should render MDX components in the full post content', async ({ rssPage }) => {
    await rssPage.goto()

    const content = await rssPage.page
      .locator("xpath=//item[title='Sequantur quaeritis tandem']/*[name()='content:encoded']")
      .textContent()

    expect(content).toContain('<aside aria-label="Note">')
    expect(content).toContain('Aenean consequat nulla id ante aliquam')
    expect(content).toContain('address_google.public_cross(query_mebibyte + adc_utility_bar, 92);')
    expect(content).not.toContain('import { Aside }')
  })

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
