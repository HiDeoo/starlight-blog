import { expect, test } from './test'

test('should fallback to the config author is none are provided in the frontmatter', async ({ postPage }) => {
  await postPage.goto('nitidum-fuit')

  await expect(postPage.content.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the referenced author in the frontmatter', async ({ postPage }) => {
  await postPage.goto('funda-pro')

  await expect(postPage.content.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the author specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('spectat-fingit')

  await expect(postPage.content.getByRole('link', { name: 'Ghost' })).toBeVisible()
})

test('should use the authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('haerent-huc-curae')

  await expect(postPage.content.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.content.getByRole('link', { name: 'Astro' })).toBeVisible()
})

test('should use the referenced authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('iove-ad-thyrsos-sororis')

  await expect(postPage.content.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.content.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should display author title', async ({ postPage }) => {
  await postPage.goto('sequantur-quaeritis-tandem')

  await expect(postPage.content.getByRole('link', { name: 'Starlight Aficionado' })).toBeVisible()
})

test('should not display tags in a post not having tags', async ({ postPage }) => {
  await postPage.goto('mihi-terrae-somnia')

  await expect(postPage.content.getByText('Tags: ', { exact: true })).not.toBeVisible()
})

test('should display tags in a post having tags', async ({ postPage }) => {
  await postPage.goto('tollere-cepit-formidabilis-currere')

  await expect(postPage.content.getByText('Tags: ', { exact: true })).toBeVisible()

  const starlightTag = postPage.content.getByRole('link', { exact: true, name: 'Starlight' })
  const amazingContentTag = postPage.content.getByRole('link', { exact: true, name: 'Amazing Content' })

  await expect(starlightTag).toBeVisible()
  await expect(starlightTag).toHaveAttribute('href', '/blog/tags/starlight')

  await expect(amazingContentTag).toBeVisible()
  await expect(amazingContentTag).toHaveAttribute('href', '/blog/tags/amazing-content')
})

test('should display navigation links', async ({ postPage }) => {
  await postPage.goto('nitidum-fuit')

  await expect(postPage.prevLink).toBeVisible()
  await expect(postPage.prevLink).toHaveAttribute('href', '/blog/funda-pro')
  await expect(postPage.nextLink).not.toBeVisible()

  await postPage.goto('funda-pro')

  await expect(postPage.prevLink).toBeVisible()
  await expect(postPage.prevLink).toHaveAttribute('href', '/blog/spectat-fingit')
  await expect(postPage.nextLink).toBeVisible()
  await expect(postPage.nextLink).toHaveAttribute('href', '/blog/nitidum-fuit')

  await postPage.goto('vario-nunc-polo')

  await expect(postPage.prevLink).toBeVisible()
  await expect(postPage.prevLink).toHaveAttribute('href', '/blog/sequantur-quaeritis-tandem')
  await expect(postPage.nextLink).toBeVisible()
  await expect(postPage.nextLink).toHaveAttribute('href', '/blog/mihi-terrae-somnia')

  await postPage.goto('sequantur-quaeritis-tandem')

  await expect(postPage.prevLink).not.toBeVisible()
  await expect(postPage.nextLink).toBeVisible()
  await expect(postPage.nextLink).toHaveAttribute('href', '/blog/vario-nunc-polo')
})

test('should include a cover image', async ({ postPage }) => {
  await postPage.goto('vario-nunc-polo')

  await expect(postPage.content.getByRole('img', { name: 'A cover' })).toBeVisible()
})

test('should include cover images for dark and light mode', async ({ postPage }) => {
  await postPage.goto('ipsum-nunc-aliquet')

  await expect(postPage.content.getByRole('img', { name: 'Different covers in dark and light mode' })).toBeVisible()

  expect(await postPage.content.locator('figure img').count()).toBe(2)
})

test.describe('i18n', () => {
  test('should display the localized author', async ({ postPage }) => {
    await postPage.goto('achivi-amans', 'fr')

    await expect(postPage.content.getByRole('link', { name: 'Fantôme' })).toBeVisible()
  })

  test('should display localized tags', async ({ postPage }) => {
    await postPage.goto('achivi-amans', 'fr')

    const tag = postPage.content.getByRole('link', { exact: true, name: 'Ébauche' })

    await expect(tag).toBeVisible()
    await expect(tag).toHaveAttribute('href', '/fr/blog/tags/ébauche')
  })

  test('should display localized navigation links', async ({ postPage }) => {
    await postPage.goto('nitidum-fuit', 'fr')

    await expect(postPage.prevLink).toHaveAttribute('href', '/fr/blog/funda-pro')

    await postPage.goto('funda-pro', 'fr')

    await expect(postPage.prevLink).toHaveAttribute('href', '/fr/blog/spectat-fingit')
    await expect(postPage.nextLink).toHaveAttribute('href', '/fr/blog/nitidum-fuit')

    await postPage.goto('vario-nunc-polo', 'fr')

    await expect(postPage.prevLink).toHaveAttribute('href', '/fr/blog/sequantur-quaeritis-tandem')
    await expect(postPage.nextLink).toHaveAttribute('href', '/fr/blog/mihi-terrae-somnia')

    await postPage.goto('sequantur-quaeritis-tandem', 'fr')

    await expect(postPage.prevLink).not.toBeVisible()
    await expect(postPage.nextLink).toHaveAttribute('href', '/fr/blog/vario-nunc-polo')

    await postPage.goto('ipsum-nunc-aliquet', 'fr')
    await expect(postPage.nextLink).toHaveAttribute('href', '/fr/blog/achivi-amans')
    await expect(postPage.nextLink).toHaveText('Achivi amans (fr)')
  })

  test('should display a fallback notice when appropriate', async ({ postPage }) => {
    await postPage.goto('ipsum-nunc-aliquet', 'fr')

    const notice = postPage.content.getByText('Ce contenu n’est pas encore disponible dans votre langue.', {
      exact: false,
    })

    await expect(notice).toBeVisible()

    await postPage.goto('achivi-amans', 'fr')

    await expect(notice).not.toBeVisible()
  })
})
