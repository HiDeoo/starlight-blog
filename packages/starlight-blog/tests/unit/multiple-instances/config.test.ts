import { expect, test } from 'vitest'

import { validateConfig } from '../../../libs/config'

test('supports multiple blog configurations', () => {
  const configs = validateConfig([{ prefix: 'blog' }, { prefix: 'news' }])

  expect(configs.map((config) => config.prefix)).toEqual(['blog', 'news'])
})

test('errors with duplicate blog prefixes', () => {
  expect(() => validateConfig([{ prefix: 'blog' }, { prefix: 'blog' }])).toThrowErrorMatchingInlineSnapshot(`
    [AstroUserError: Invalid starlight-blog configuration:

    Duplicate blog prefix 'blog'. Each blog must use a unique prefix.]
  `)
})

test('errors with nested blog prefixes', () => {
  expect(() => validateConfig([{ prefix: 'blog' }, { prefix: 'blog/releases' }])).toThrowErrorMatchingInlineSnapshot(`
    [AstroUserError: Invalid starlight-blog configuration:

    Nested blog prefixes are not supported: 'blog' and 'blog/releases'.]
  `)
})
