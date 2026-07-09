import { expect, test } from 'vitest'

import {
  getBlogConfigFromPath,
  getRelativeBlogUrl,
  isAnyBlogAuthorPage,
  isAnyBlogPostPage,
  isAnyBlogTagPage,
  isBlogPaginationPage,
  isBlogRoot,
} from '../../../libs/page'
import { getTestConfig } from '../utils'

const blogConfig = getTestConfig('blog')
const newsConfig = getTestConfig('news')

test('gets the blog config matching a path', () => {
  expect(getBlogConfigFromPath('blog')?.prefix).toBe('blog')
  expect(getBlogConfigFromPath('blog/post-1')?.prefix).toBe('blog')

  expect(getBlogConfigFromPath('news')?.prefix).toBe('news')
  expect(getBlogConfigFromPath('news/story-1')?.prefix).toBe('news')
})

test('does not get a blog config for a path that does not match any blog prefix', () => {
  expect(getBlogConfigFromPath('newsletter')?.prefix).toBeUndefined()
})

test('generates URLs with the matching blog prefix', () => {
  expect(getRelativeBlogUrl(blogConfig, '/', undefined)).toBe('/blog/')

  expect(getRelativeBlogUrl(newsConfig, '/', undefined)).toBe('/news/')
  expect(getRelativeBlogUrl(newsConfig, '/tags/release', undefined)).toBe('/news/tags/release/')
})

test('matches pages only inside the given blog prefix', () => {
  expect(isBlogRoot(blogConfig, 'blog')).toBe(true)
  expect(isBlogRoot(newsConfig, 'blog')).toBe(false)

  expect(isBlogPaginationPage(blogConfig, 'news/2')).toBe(false)
  expect(isBlogPaginationPage(newsConfig, 'news/2')).toBe(true)

  expect(isAnyBlogPostPage(blogConfig, 'news/story-1')).toBe(false)
  expect(isAnyBlogPostPage(newsConfig, 'news/story-1')).toBe(true)

  expect(isAnyBlogTagPage(blogConfig, 'news/tags/release')).toBe(false)
  expect(isAnyBlogTagPage(newsConfig, 'news/tags/release')).toBe(true)

  expect(isAnyBlogAuthorPage(blogConfig, 'news/authors/alice')).toBe(false)
  expect(isAnyBlogAuthorPage(newsConfig, 'news/authors/alice')).toBe(true)
})
