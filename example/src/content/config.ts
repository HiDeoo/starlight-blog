import { i18nSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'
import { docsAndBlogSchema } from 'starlight-blog/schema'

export const collections = {
  docs: defineCollection({ schema: docsAndBlogSchema }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
}
