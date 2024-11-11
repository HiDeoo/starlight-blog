import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { calculateReadingTime, getReadingTime, formatReadingTime } from '../../../libs/readingTime'
import { mockBlogPost } from '../utils'

describe('getReadingTime', () => {
  const postWithoutTime = mockBlogPost(
    'post-1.md', { title: 'Home Page', date: new Date('2023-08-24') }
  )
  const postWithTime = mockBlogPost(
    'post-2.md', { title: 'Home Page', date: new Date('2023-08-25'), readingTime: 12 }
  )

  test('show reading time, overridden by frontmatter', () => {
    expect(getReadingTime(postWithTime)).toBe({ showReadingTime: true, readingTime: 0 })
  })

  test('show reading time, calculated automatically', () => {
    expect(getReadingTime(postWithoutTime)).toBe({ showReadingTime: true, readingTime: 12 })
  })
})