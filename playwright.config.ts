import { defineConfig } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',



  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* REPORT */
  reporter: [
    // Hiển thị pass/fail realtime ở terminal
    ['list'],

    // HTML report
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],

    // Custom reporter: thống kê + gửi Telegram + dọn dẹp (Tạm thời tắt khi đang viết test)
    // ['./utils/telegram-reporter.js'],
  ],

  /* Shared settings */
  use: {
    baseURL: 'http://10.0.229.130:8086/api/v2/',

    // Trace khi fail
    trace: 'retain-on-failure',

    // Screenshot khi fail
    screenshot: 'only-on-failure',

    // Video khi fail
    video: 'retain-on-failure',
  },

  /* API project - không cần browser */
  projects: [
    {
      name: 'API',
      use: {},
    },
  ],
});