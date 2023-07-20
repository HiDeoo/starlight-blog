declare module 'astro:content' {
  export interface AstroCollectionEntry<TData> {
    body: string
    collection: string
    data: TData
    id: string
    slug: string
  }

  export function getCollection<TData>(
    collection: TName,
    filter?: (entry: AstroCollectionEntry<TData>) => boolean,
  ): Promise<AstroCollectionEntry<TData>[]>
}
