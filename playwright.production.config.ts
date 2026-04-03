import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials from .env.production.test (gitignored, not committed)
const envTestPath = path.resolve(__dirname, '.env.production.test');
if (fs.existsSync(envTestPath)) {
  for (const line of fs.readFileSync(envTestPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

/**
 * Playwright config for production login flow diagnostics.
 * Tests against live production services — no local webserver.
 *
 * Usage:
 *   pnpm test:e2e:prod
 *   (credentials loaded from .env.production.test)
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
