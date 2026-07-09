import { defineVitestConfig } from '../test'

export default defineVitestConfig([
  { prefix: 'blog', title: 'Blog' },
  { prefix: 'news', title: 'News' },
])
