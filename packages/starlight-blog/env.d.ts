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

declare module 'astro:container' {
  export function loadRenderers(
    renderers: import('astro').AstroRenderer[],
  ): Promise<import('astro').SSRLoadedRenderer[]>
}

declare namespace App {
  type StarlightLocals = import('@astrojs/starlight').StarlightLocals
  interface Locals extends StarlightLocals {}
}

declare namespace StarlightApp {
  type Translations = typeof import('./translations').Translations.en
  interface I18n extends Translations {}
}
