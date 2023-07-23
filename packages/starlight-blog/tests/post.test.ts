import { expect, test } from './test'

test('should fallback to the config author is none are provided in the frontmatter', async ({ postPage }) => {
  await postPage.goto('nitidum-fuit')

  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the referenced author in the frontmatter', async ({ postPage }) => {
  await postPage.goto('funda-pro')

  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should use the author specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('spectat-fingit')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
})

test('should use the authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('haerent-huc-curae')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { name: 'Astro' })).toBeVisible()
})

test('should use the referenced authors specified in the frontmatter', async ({ postPage }) => {
  await postPage.goto('iove-ad-thyrsos-sororis')

  await expect(postPage.page.getByRole('link', { name: 'Ghost' })).toBeVisible()
  await expect(postPage.page.getByRole('link', { name: 'HiDeoo' })).toBeVisible()
})

test('should not display tags in a post not having tags', async ({ postPage }) => {
  await postPage.goto('post-2')

  await expect(postPage.page.getByText('Tags: ', { exact: true })).not.toBeVisible()
})

test('should display tags in a post having tags', async ({ postPage }) => {
  await postPage.goto('tollere-cepit-formidabilis-currere')

  await expect(postPage.page.getByText('Tags: ', { exact: true })).toBeVisible()

  const starlightTag = postPage.page.getByRole('link', { exact: true, name: 'Starlight' })
  const amazingContentTag = postPage.page.getByRole('link', { exact: true, name: 'Amazing Content' })

  await expect(starlightTag).toBeVisible()
  expect(await starlightTag.getAttribute('href')).toBe('/blog/tags/starlight')

  await expect(amazingContentTag).toBeVisible()
  expect(await amazingContentTag.getAttribute('href')).toBe('/blog/tags/amazing-content')
})

test('should display navigation links', async ({ postPage }) => {
  await postPage.goto('nitidum-fuit')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/funda-pro')
  await expect(postPage.nextLink).not.toBeVisible()

  await postPage.goto('funda-pro')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/spectat-fingit')
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/nitidum-fuit')

  await postPage.goto('vario-nunc-polo')

  await expect(postPage.prevLink).toBeVisible()
  expect(await postPage.prevLink.getAttribute('href')).toBe('/blog/sequantur-quaeritis-tandem')
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/mihi-terrae-somnia')

  await postPage.goto('sequantur-quaeritis-tandem')

  await expect(postPage.prevLink).not.toBeVisible()
  await expect(postPage.nextLink).toBeVisible()
  expect(await postPage.nextLink.getAttribute('href')).toBe('/blog/vario-nunc-polo')
})
