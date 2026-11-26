import { defineConfig } from 'tsdown'

export default defineConfig({
  copy: [
    { from: 'src/**/*.astro', flatten: false },
    { from: 'src/**/*.css', flatten: false },
  ],
  deps: {
    neverBundle: [/^astro:/, /^virtual:starlight-blog\//],
  },
  dts: true,
  entry: ['src/**/*.ts'],
  fixedExtension: false,
  publint: { strict: true },
  unbundle: true,
})
