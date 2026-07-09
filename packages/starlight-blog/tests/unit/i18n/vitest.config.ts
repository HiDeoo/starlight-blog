import { defineVitestConfig } from '../test'

export default defineVitestConfig(
  {
    title: {
      en: 'Blog',
      fr: 'Blogue',
    },
  },
  {
    title: 'Starlight Blog i18n',
    locales: {
      root: { label: 'English', lang: 'en', dir: 'ltr' },
      fr: { label: 'Français', lang: 'fr', dir: 'ltr' },
      'zh-cn': { label: '简体中文', lang: 'zh-CN', dir: 'ltr' },
    },
  },
)
