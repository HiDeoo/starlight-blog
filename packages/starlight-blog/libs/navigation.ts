import type { StarlightUserConfig } from '@astrojs/starlight/types'

import type { StarlightBlogConfig } from './config'

export function isNavigationWithSidebarLink(config: StarlightBlogConfig) {
  return config.navigation === 'header-start' || config.navigation === 'header-end'
}

export function isNavigationWithCustomCss(config: StarlightBlogConfig) {
  return config.navigation === 'header-start' || config.navigation === 'header-end'
}

export function isNavigationOverride(component: keyof NonNullable<StarlightUserConfig['components']>) {
  return component === 'ThemeSelect' || component === 'SiteTitle'
}
