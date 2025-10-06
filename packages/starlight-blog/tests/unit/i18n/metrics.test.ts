import { expect, test } from 'vitest'

import { getMetrics } from '../../../libs/metrics'

const oneMinuteText = 'some text content '.repeat(71) // 3 word * 71 = 213 words

test('computes metrics for an empty string', () => {
  const { readingTime, words } = getMetrics('', 'en', undefined)

  expect(readingTime.minutes).toBe(0)
  expect(readingTime.seconds).toBe(0)
  expect(words.rounded).toBe(0)
  expect(words.total).toBe(0)
})

test('computes metrics for a string taking less than a minute to read', () => {
  const { readingTime, words } = getMetrics('ceci est un test', 'fr', undefined)

  expect(readingTime.minutes).toBe(1)
  expect(readingTime.seconds).toBe(2)
  expect(words.rounded).toBe(100)
  expect(words.total).toBe(4)
})

test('computes metrics for a string taking a minute to read', () => {
  const { readingTime, words } = getMetrics(oneMinuteText, 'en', undefined)

  expect(readingTime.minutes).toBe(1)
  expect(readingTime.seconds).toBe(60)
  expect(words.rounded).toBe(300)
  expect(words.total).toBe(213)
})

test('computes metrics for a string taking more than a minute to read', () => {
  const { readingTime, words } = getMetrics('this is a test '.repeat(1065), 'en', undefined) // 4 words * 1065 = 4260 words = 20 minutes

  expect(readingTime.minutes).toBe(20)
  expect(readingTime.seconds).toBe(1200)
  expect(words.rounded).toBe(4300)
  expect(words.total).toBe(4260)
})

test('computes metrics for a string using CJK characters', () => {
  const { readingTime, words } = getMetrics('这是一个测试。'.repeat(200), 'zh-cn', undefined) // 4 words * 200 = 800 words

  expect(readingTime.minutes).toBe(4)
  expect(readingTime.seconds).toBe(226)
  expect(words.rounded).toBe(800)
  expect(words.total).toBe(800)
})

test('computes metrics for a string with images', () => {
  let result = getMetrics(`${oneMinuteText}<img />`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(2)
  expect(result.readingTime.seconds).toBe(60 + 12)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)

  result = getMetrics(`${oneMinuteText}${'<img />'.repeat(2)}`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(2)
  expect(result.readingTime.seconds).toBe(60 + 12 + 11)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)

  result = getMetrics(`${oneMinuteText}${'<img />'.repeat(3)}`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(2)
  expect(result.readingTime.seconds).toBe(60 + 12 + 11 + 10)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)

  result = getMetrics(`${oneMinuteText}${'<img />'.repeat(9)}`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(3)
  expect(result.readingTime.seconds).toBe(60 + 12 + 11 + 10 + 9 + 8 + 7 + 6 + 5 + 4)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)

  result = getMetrics(`${oneMinuteText}${'<img />'.repeat(10)}`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(3)
  expect(result.readingTime.seconds).toBe(60 + 12 + 11 + 10 + 9 + 8 + 7 + 6 + 5 + 4 + 3)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)

  result = getMetrics(`${oneMinuteText}${'<img />'.repeat(11)}`, 'en', undefined)

  expect(result.readingTime.minutes).toBe(3)
  expect(result.readingTime.seconds).toBe(60 + 12 + 11 + 10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 3)
  expect(result.words.rounded).toBe(300)
  expect(result.words.total).toBe(213)
})

test('uses user-provided metrics', () => {
  let result = getMetrics('ceci est un test', 'fr', { readingTime: 193 })

  expect(result.readingTime.minutes).toBe(4)
  expect(result.readingTime.seconds).toBe(193)
  expect(result.words.rounded).toBe(100)
  expect(result.words.total).toBe(4)

  result = getMetrics('ceci est un test', 'fr', { words: 426 }) // 2 minutes

  expect(result.readingTime.minutes).toBe(2)
  expect(result.readingTime.seconds).toBe(120)
  expect(result.words.rounded).toBe(500)
  expect(result.words.total).toBe(426)

  result = getMetrics('ceci est un test', 'fr', { readingTime: 620, words: 852 })

  expect(result.readingTime.minutes).toBe(11)
  expect(result.readingTime.seconds).toBe(620)
  expect(result.words.rounded).toBe(900)
  expect(result.words.total).toBe(852)
})
