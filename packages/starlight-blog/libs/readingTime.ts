import config from 'virtual:starlight-blog-config'

import type { StarlightBlogEntry } from './content'

export interface ReadingTimeResult {
  showReadingTime: boolean
  readingTime?: number
}

export function calculateReadingTime(markdownContent: string): number {
  return Math.ceil(markdownContent.split(' ').length / 200)
}

export function getReadingTime(userConfig: StarlightBlogEntry, markdownContent: string): ReadingTimeResult {
  if (!config.showReadingTime && userConfig.data.readingTime === undefined) {
    return { showReadingTime: false }
  }

  const readingTime = userConfig.data.readingTime ?? calculateReadingTime(markdownContent)
  return { showReadingTime: true, readingTime }
}

export function formatReadingTime(readingTime: number): string {
  return readingTime < 60 ? `${readingTime} min` : `${Math.round(readingTime / 60)}h ${readingTime % 60}min`
}
