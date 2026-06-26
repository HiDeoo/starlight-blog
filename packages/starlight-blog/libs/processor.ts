import type { AstroConfig } from 'astro'

import { throwPluginError } from './error'
import { remarkStarlightBlog } from './remark'
import { satteriStarlightBlog } from './satteri'

export function applyMarkdownPlugin(processor: MarkdownProcessor) {
  if (isSatteriProcessor(processor)) {
    processor.options.mdastPlugins.push(satteriStarlightBlog())
  } else if (isUnifiedProcessor(processor)) {
    processor.options.remarkPlugins.push([remarkStarlightBlog])
  } else {
    throwPluginError("The configured 'markdown.processor' is not supported by the starlight-blog plugin.")
  }
}

function isSatteriProcessor(processor: unknown): processor is SatteriMarkdownProcessor {
  if (typeof processor !== 'object' || processor === null) return false
  const candidate = processor as { name?: unknown; options?: { mdastPlugins?: unknown } }
  return candidate.name === 'satteri' && Array.isArray(candidate.options?.mdastPlugins)
}

function isUnifiedProcessor(processor: unknown): processor is UnifiedMarkdownProcessor {
  if (typeof processor !== 'object' || processor === null) return false
  const candidate = processor as { name?: unknown; options?: { remarkPlugins?: unknown } }
  return candidate.name === 'unified' && Array.isArray(candidate.options?.remarkPlugins)
}

type MarkdownProcessor = NonNullable<AstroConfig['markdown']['processor']>

interface SatteriMarkdownProcessor {
  name: 'satteri'
  options: { mdastPlugins: unknown[] }
}

interface UnifiedMarkdownProcessor {
  name: 'unified'
  options: { remarkPlugins: unknown[] }
}
