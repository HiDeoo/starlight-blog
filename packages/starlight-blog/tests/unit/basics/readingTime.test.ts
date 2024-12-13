import { describe, expect, test } from 'vitest'

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
    expect(calculateReadingTime('')).toBe(1)
  })
})

describe('getReadingTime', () => {
  const postWithoutTime = mockBlogPost('post-1.md', { title: 'Home Page', date: new Date('2023-08-24') })
  const postWithTime = mockBlogPost('post-2.md', { title: 'Home Page', date: new Date('2023-08-25'), readingTime: 12 })

  test('do not show reading time', () => {
    expect(getReadingTime(postWithoutTime, `apple `.repeat(200).trim())).toStrictEqual({ showReadingTime: false })
  })

  test('show reading time, set by frontmatter', () => {
    expect(getReadingTime(postWithTime, `apple `.repeat(200).trim())).toStrictEqual({
      showReadingTime: true,
      readingTime: 12,
    })
  })
})

describe('formatReadingTime', () => {
  test('get minutes', () => {
    expect(formatReadingTime(0)).toBe('0 min')
    expect(formatReadingTime(1)).toBe('1 min')
  })

  test('get hours', () => {
    expect(formatReadingTime(60)).toBe('1 h')
    expect(formatReadingTime(120)).toBe('2 h')
  })

  test('get minutes and hours', () => {
    expect(formatReadingTime(61)).toBe('1h 1min')
    expect(formatReadingTime(231)).toBe('3h 51min')
  })
})
