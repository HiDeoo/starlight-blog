import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { calculateReadingTime, getReadingTime, formatReadingTime } from '../../../libs/readingTime'
import { mockBlogPost } from '../utils'

describe('calculateReadingTime', () => {
  test('devide without remainder', () => {
    expect(calculateReadingTime(`apple `.repeat(200).trim())).toBe(1)
    expect(calculateReadingTime(`apple `.repeat(400).trim())).toBe(2)
  })

  test('devide with remainder', () => {
    expect(calculateReadingTime(`apple `.repeat(201).trim())).toBe(2)
    expect(calculateReadingTime(`apple `.repeat(450).trim())).toBe(3)
  })

  test('devide with empty content', () => {
    expect(calculateReadingTime('')).toBe(0)
  })
})

describe('getReadingTime', () => {
  const postWithoutTime = mockBlogPost(
    'post-1.md', { title: 'Home Page', date: new Date('2023-08-24') }
  )
  const postWithTime = mockBlogPost(
    'post-2.md', { title: 'Home Page', date: new Date('2023-08-25'), readingTime: 12 }
  )

  test('do not show reading time', () => {
    expect(getReadingTime(postWithoutTime)).toBe({ showReadingTime: false })
  })

  test('show reading time, set by frontmatter', () => {
    expect(getReadingTime(postWithTime)).toBe({ showReadingTime: true, readingTime: 12 })
  })
})