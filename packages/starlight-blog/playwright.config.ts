import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  forbidOnly: !!process.env['CI'],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: [
    {
      command: 'pnpm run build && pnpm run preview',
      cwd: '../../docs',
      reuseExistingServer: !process.env['CI'],
      url: 'http://localhost:4321',
    },
  ],
})
