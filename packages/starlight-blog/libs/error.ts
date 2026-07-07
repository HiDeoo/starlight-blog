import { AstroError } from 'astro/errors'

export function throwPluginError(message: string, hint?: string): never {
  const hintHeader = 'See the error report above for more informations.'
  const hintFooter =
    '\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/starlight-blog/issues/new/choose'

  throw new AstroError(message, hint ? `${hint}${hintFooter}` : `${hintHeader}${hintFooter}`)
}
