import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for production login flow diagnostics.
 * Tests against live production services — no local webserver.
 *
 * Usage:
 *   PROD_TEST_EMAIL=admin@example.com PROD_TEST_PASSWORD=secret pnpm test:e2e:prod
 */
export default defineConfig({
  testDir: './tests/e2e-production',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  timeout: 90_000,
  use: {
    baseURL: process.env.PROD_BASE_URL || 'http://localhost:3000',
    headless: process.env.CI === 'true',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
