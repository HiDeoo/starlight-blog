import { defineVitestConfig } from '../test'

export default defineVitestConfig(
  {},
  {
    title: 'Starlight Blog Basics',
    description: 'Basic tests for the Starlight Blog plugin.',
    locales: {
      root: { label: 'English', lang: 'en', dir: 'ltr' },
      fr: { label: 'Français', lang: 'fr', dir: 'ltr' },
      'zh-cn': { label: '简体中文', lang: 'zh-CN', dir: 'ltr' },
    },
  },
)
