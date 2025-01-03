import config from 'virtual:starlight-blog-config'

export function showBlogLinkInThemeSelect(): boolean {
    return config.enableLinkInThemeSelector;
  }