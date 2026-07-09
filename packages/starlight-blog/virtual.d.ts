declare module 'virtual:starlight-blog/configs' {
  const StarlightBlogConfigs: ReadonlyMap<string, import('./libs/config').StarlightBlogConfig>

  export default StarlightBlogConfigs
}

declare module 'virtual:starlight-blog/context' {
  const StarlightBlogContext: import('./libs/vite').StarlightBlogContext

  export default StarlightBlogContext
}

declare module 'virtual:starlight-blog/images' {
  type ImageMetadata = import('astro').ImageMetadata

  export const authors: Record<string, Record<string, string | ImageMetadata>>
}
