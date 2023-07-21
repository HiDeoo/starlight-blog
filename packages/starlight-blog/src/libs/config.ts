import { z } from 'astro/zod'

const configSchema = z
  .object({
    // TODO(HiDeoo)
    postCount: z.number().min(1).default(5),
    // TODO(HiDeoo)
    recentPostCount: z.number().min(1).default(10),
    // TODO(HiDeoo)
    title: z.string().default('Blog'),
  })
  .default({})

export function validateConfig(userConfig: unknown): StarlightBlogConfig {
  const config = configSchema.safeParse(userConfig)

  if (!config.success) {
    const errors = config.error.flatten()

    throw new Error(`Invalid starlight-blog configuration:

${errors.formErrors.map((formError) => ` - ${formError}`).join('\n')}
${Object.entries(errors.fieldErrors)
  .map(([fieldName, fieldErrors]) => ` - ${fieldName}: ${fieldErrors.join(' - ')}`)
  .join('\n')}
  `)
  }

  return config.data
}

export type StarlightBlogConfig = z.infer<typeof configSchema>
