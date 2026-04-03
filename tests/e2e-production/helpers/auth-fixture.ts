import { test as base, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Tenant admin — loaded from .env.production.test (no hardcoded passwords)
const PROD_EMAIL = process.env.PROD_TEST_EMAIL;
const PROD_PASSWORD = process.env.PROD_TEST_PASSWORD;
const STORAGE_STATE_PATH = path.join(__dirname, '..', '..', '..', 'test-results', 'production', '.auth-state.json');

/**
 * Performs the SSO login flow and returns the authenticated page.
 * Persists browser state to disk so subsequent tests skip re-login.
 */
async function performLogin(page: Page): Promise<void> {
  if (!PROD_EMAIL || !PROD_PASSWORD) {
    throw new Error('Set PROD_TEST_EMAIL and PROD_TEST_PASSWORD env vars');
  }

  await page.goto('/login');
  await page.waitForURL('**/accounts.codevertexitsolutions.com/**', { timeout: 30_000 });

  const emailInput = page.locator('input[name="email"], input[type="email"], input[id="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"], input[id="password"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.fill(PROD_EMAIL);
  await passwordInput.fill(PROD_PASSWORD);

  await page.locator('button[type="submit"]').first().click();

  // Wait for callback then dashboard
  await page.waitForURL('**/auth/callback**', { timeout: 30_000 });
  await page.waitForURL(
    (url) => {
      const pathname = new URL(url).pathname;
      return pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname === '/unauthorized';
    },
    { timeout: 30_000 },
  );

  // Wait for dashboard to fully hydrate
  await page.waitForTimeout(3_000);
}

/**
 * Extended Playwright test fixture that provides an authenticated page.
 * Uses storageState to avoid re-login for every test.
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    // Try to reuse stored auth state
    let context;
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      try {
        context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
        const page = await context.newPage();
        // Verify the session is still valid
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.waitForTimeout(2_000);
        const url = page.url();
        if (url.includes('/dashboard')) {
          await use(page);
          await context.close();
          return;
        }
        // Session expired, close and re-login
        await page.close();
        await context.close();
      } catch {
        // Stored state is invalid, fall through to fresh login
        if (context) await context.close();
      }
    }

    // Fresh login
    context = await browser.newContext();
    const page = await context.newPage();
    await performLogin(page);

    // Save storage state for reuse
    const outputDir = path.dirname(STORAGE_STATE_PATH);
    fs.mkdirSync(outputDir, { recursive: true });
    await context.storageState({ path: STORAGE_STATE_PATH });

    await use(page);
    await context.close();
  },
});

export { expect };
