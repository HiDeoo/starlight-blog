import { transformHTMLForMetrics } from './html'
import { getLangFromLocale, type Locale } from './i18n'

// https://iovs.arvojournals.org/article.aspx?articleid=2166061
// 184 ± 29 words/min → 213 words/min
const wordsPerMinute = 213

export async function getMetrics(html: string, locale: Locale): Promise<Metrics> {
  const { content, images } = await transformHTMLForMetrics(html)

  const words = getWordCount(content, getLangFromLocale(locale))

  let seconds = (words / wordsPerMinute) * 60
  seconds = addImagesTime(seconds, images)

  return {
    readingTime: {
      minutes: Math.ceil(seconds / 60),
      seconds: Math.ceil(seconds),
    },
    words: {
      rounded: Math.ceil(words / 100) * 100,
      total: words,
    },
  }
}

function getWordCount(markdown: string, lang: string) {
  const segmenter = new Intl.Segmenter(lang, { granularity: 'word' })
  let wordCount = 0

  for (const segment of segmenter.segment(markdown)) {
    if (segment.isWordLike) wordCount++
  }

  return wordCount
}

function addImagesTime(seconds: number, images: number): number {
  if (images === 0) return seconds

  for (let i = 0; i < images; i++) seconds += getImageTime(i)

  return seconds
}

function getImageTime(index: number): number {
  // https://blog.medium.com/read-time-and-you-bc2048ab620c
  return Math.max(3, 12 - index)
}

// TODO(HiDeoo) add comment about behavior/units/etc.
export interface Metrics {
  readingTime: {
    minutes: number
    seconds: number
  }
  words: {
    rounded: number
    total: number
  }
}
