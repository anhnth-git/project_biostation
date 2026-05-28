import { defineConfig } from '@playwright/test';

import { ENV } from './src/helpers/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],
  use: {
    baseURL: ENV.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'contract',
      testMatch: 'contract/**/*.spec.ts',
    },
    {
      name: 'e2e',
      testMatch: 'e2e/**/*.spec.ts',
    },
    {
      name: 'smoke',
      testMatch: 'smoke/**/*.spec.ts',
    },
  ],
});
