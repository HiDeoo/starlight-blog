import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { calculateReadingTime, getReadingTime, formatReadingTime } from '../../../libs/readingTime'

describe('calculateReadingTime', () => {
  test('devide without remainder', () => {
    expect(calculateReadingTime(`apple `.repeat(200).trim())).toBe(1)
    expect(calculateReadingTime(`apple `.repeat(400).trim())).toBe(2)
  })

  test('devide with remainder', () => {
    expect(calculateReadingTime(`apple `.repeat(201).trim())).toBe(2)
    expect(calculateReadingTime(`apple `.repeat(450).trim())).toBe(3)
  })
})

describe('getReadingTime', () => {
  test('do not show reading time', () => {
    expect(getReadingTime()).toBe(1)
    expect(getReadingTime()).toBe(1)
  })

  test('show reading time, set by frontmatter', () => {
    expect(getReadingTime()).toBe(1)
    expect(getReadingTime()).toBe(1)
  })
})