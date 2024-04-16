declare module 'virtual:starlight-blog-config' {
  const StarlightBlogConfig: import('./libs/config').StarlightBlogConfig

  export default StarlightBlogConfig
}

declare module 'virtual:starlight-blog-context' {
  const StarlightBlogContext: import('./libs/vite').StarlightBlogContext

  export default StarlightBlogContext
}
