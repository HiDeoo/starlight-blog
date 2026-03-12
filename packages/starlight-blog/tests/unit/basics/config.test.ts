import { describe, expect, test } from 'vitest'

import { validateConfig } from '../../../libs/config'

describe('counts', () => {
  test('uses default count values', () => {
    const config = validateConfig({})

    expect(config.postCount).toBe(5)
    expect(config.recentPostCount).toBe(10)
  })

  test('supports custom count values', () => {
    const config = validateConfig({ postCount: 3, recentPostCount: 7 })

    expect(config.postCount).toBe(3)
    expect(config.recentPostCount).toBe(7)
  })

  test('supports `Infinity` for count values', () => {
    const config = validateConfig({ postCount: Infinity, recentPostCount: Infinity })

    expect(config.postCount).toBeTypeOf('number')
    expect(config.recentPostCount).toBeTypeOf('number')
  })

  test('errors with less than 1 for count values', () => {
    expect(() => validateConfig({ postCount: 0, recentPostCount: -3 })).toThrowErrorMatchingInlineSnapshot(`
      [AstroUserError: Invalid starlight-blog configuration:

      ✖ Too small: expected number to be >=1
        → at postCount
      ✖ Too small: expected number to be >=1
        → at recentPostCount
      ]
    `)
  })
})
