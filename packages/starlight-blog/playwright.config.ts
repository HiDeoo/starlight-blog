import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env['CI']

export default defineConfig({
  forbidOnly: isCI,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Re-use system Chrome on CI to avoid re-installing it on every run.
        channel: isCI ? 'chrome' : undefined,
        headless: true,
      },
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
      reuseExistingServer: !isCI,
      url: 'http://localhost:4321',
    },
  ],
})
