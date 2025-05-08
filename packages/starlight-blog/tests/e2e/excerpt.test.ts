import { expect, test } from './test'

test('should render basic markdown content in excerpt from frontmatter', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')

  await expect(articles.first().locator('strong').getByText('vestibulum')).toBeVisible()
})

test('should not use excerpt delimiters when the excerpt is defined in frontmatter', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')

  await expect(articles.first().getByRole('heading', { name: 'Et recingunt etiam' })).not.toBeVisible()
})

test('should render excerpt using delimiters for Markdown content', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')
  const article = articles.nth(1)

  await expect(article.getByRole('heading', { name: 'Canes plura palmas eodem huc scelerate spectat' })).toBeVisible()
  await expect(article.getByRole('heading', { name: 'Notae esse et gurgite sibi dat dona' })).not.toBeVisible()
})

test('should render excerpt using delimiters for MDX content', async ({ blogPage }) => {
  await blogPage.goto()

  const articles = blogPage.page.getByRole('article')
  const article = articles.nth(3)

  await expect(
    article.getByRole('heading', { name: 'Traharis miserae contraria quem cinerem tamen haberent' }),
  ).toBeVisible()
  await expect(
    article.getByRole('heading', { name: 'Soleo pereunt ferro sapienter perierunt filia nudumque' }),
  ).not.toBeVisible()
})

test('should not use excerpt delimiters in code blocks', async ({ blogPage }) => {
  await blogPage.goto(3)

  const articles = blogPage.page.getByRole('article')

  await expect(articles.nth(3).getByText("name_tutorial_str = '<!-- excerpt -->';")).toBeVisible()
})

test('should not use excerpt delimiters in post pages', async ({ postPage }) => {
  await postPage.goto('vario-nunc-polo')

  await expect(
    postPage.content.getByRole('heading', { name: 'Canes plura palmas eodem huc scelerate spectat' }),
  ).toBeVisible()
  await expect(postPage.content.getByRole('heading', { name: 'Notae esse et gurgite sibi dat dona' })).toBeVisible()
})
