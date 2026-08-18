import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'https://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    },
  },
});
