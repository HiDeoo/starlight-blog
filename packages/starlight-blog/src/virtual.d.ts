declare module 'virtual:starlight-blog-config' {
  const StarlightBlogConfig: import('./libs/config').StarlightBlogConfig

  const config: typeof StarlightBlogConfig & { locale: string }

  export default config
}
