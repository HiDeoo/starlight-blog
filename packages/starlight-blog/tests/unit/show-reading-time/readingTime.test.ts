import { describe, expect, test } from 'vitest'

import { getReadingTime } from '../../../libs/readingTime'
import { mockBlogPost } from '../utils'

describe('getReadingTime', () => {
  const postWithoutTime = mockBlogPost('post-1.md', { title: 'Home Page', date: new Date('2023-08-24') })
  const postWithTime = mockBlogPost('post-2.md', { title: 'Home Page', date: new Date('2023-08-25'), readingTime: 12 })

  test('show reading time, calculated automatically', () => {
    expect(getReadingTime(postWithoutTime, `apple `.repeat(200).trim())).toStrictEqual({
      showReadingTime: true,
      readingTime: 1,
    })
  })

  test('show reading time, overridden by frontmatter', () => {
    expect(getReadingTime(postWithTime, `apple `.repeat(200).trim())).toStrictEqual({
      showReadingTime: true,
      readingTime: 12,
    })
  })
})
