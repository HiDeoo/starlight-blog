declare module 'astro:content' {
  export interface AstroCollectionEntry<TData> {
    body: string
    collection: string
    data: TData
    id: string
    render: () => Promise<{
      Content: import('astro').MarkdownInstance<object>['Content']
    }>
    slug: string
  }

  export function getCollection<TData>(
    collection: string,
    filter?: (entry: AstroCollectionEntry<TData>) => boolean,
  ): Promise<AstroCollectionEntry<TData>[]>

  export function getEntry<TData>(collection: string, slug: string): Promise<AstroCollectionEntry<TData>>
}
