import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { calculateReadingTime, getReadingTime, formatReadingTime } from '../../../libs/readingTime'

describe('getReadingTime', () => {
  test('show reading time, overridden by frontmatter', () => {
    expect(getReadingTime()).toBe(1)
    expect(getReadingTime()).toBe(1)
  })

  test('show reading time, calculated automatically', () => {
    expect(getReadingTime()).toBe(1)
    expect(getReadingTime()).toBe(1)
  })
})