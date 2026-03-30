import { test } from '@playwright/test';
import * as path from 'path';
import { NetworkLogger } from './helpers/network-logger';

const PROD_EMAIL = process.env.PROD_TEST_EMAIL;
const PROD_PASSWORD = process.env.PROD_TEST_PASSWORD;
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe('Production Login Flow Diagnostics', () => {
  let logger: NetworkLogger;

  test.beforeEach(async ({ page }) => {
    logger = new NetworkLogger();
    logger.attachToPage(page);
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'login-flow-report');
  });

  test('full SSO login flow and dashboard access', async ({ page }) => {
    test.skip(!PROD_EMAIL || !PROD_PASSWORD, 'Set PROD_TEST_EMAIL and PROD_TEST_PASSWORD env vars');

    // Step 1: Visit homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-homepage.png'), fullPage: true });

    // Step 2: Navigate to login — should redirect to SSO
    await page.goto('/login');
    // Wait for SSO redirect to accounts.codevertexitsolutions.com
    await page.waitForURL('**/accounts.codevertexitsolutions.com/**', { timeout: 30_000 });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-sso-login-page.png'), fullPage: true });

    // Step 3: Fill credentials on SSO login form
    // Try common selectors for email/password fields
    const emailInput = page.locator('input[name="email"], input[type="email"], input[id="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"], input[id="password"]').first();

    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(PROD_EMAIL!);
    await passwordInput.fill(PROD_PASSWORD!);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-credentials-filled.png'), fullPage: true });

    // Step 4: Submit the login form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Step 5: Wait for callback redirect
    // The SSO should redirect back to theurbanloftcafe.com/auth/callback
    try {
      await page.waitForURL('**/auth/callback**', { timeout: 30_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-auth-callback.png'), fullPage: true });
    } catch {
      // If callback redirect didn't happen, capture current state
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-failed-no-callback-redirect.png'), fullPage: true });
      console.error('Did not reach /auth/callback. Current URL:', page.url());
    }

    // Step 6: Wait for dashboard redirect (or wherever callback sends us)
    try {
      await page.waitForURL(url => {
        const pathname = new URL(url).pathname;
        return pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname === '/unauthorized';
      }, { timeout: 30_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05-post-login-landing.png'), fullPage: true });
    } catch {
      // Capture wherever we ended up
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05-failed-no-dashboard.png'), fullPage: true });
      console.error('Did not reach dashboard. Current URL:', page.url());
    }

    // Step 7: If on dashboard, wait for it to fully load and capture final state
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      // Wait for async API calls (orders, menu, subscription, etc.)
      await page.waitForTimeout(5_000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '06-dashboard-loaded.png'), fullPage: true });
    }

    // Step 8: Generate the diagnostic report
    const report = logger.generateReport();

    // Log summary to console for immediate visibility
    console.log('\n========================================');
    console.log('LOGIN FLOW DIAGNOSTIC SUMMARY');
    console.log('========================================');
    console.log(`Final URL: ${currentUrl}`);
    console.log(`Total network requests: ${report.summary.totalRequests}`);
    console.log(`Failed requests: ${report.summary.failedRequests}`);
    console.log(`401 responses: ${report.summary.count401}`);
    console.log(`403 responses: ${report.summary.count403}`);
    console.log(`5xx errors: ${report.summary.count5xx}`);
    console.log(`Console errors: ${report.summary.consoleErrors}`);
    console.log(`Console warnings: ${report.summary.consoleWarnings}`);
    console.log(`Uncaught JS errors: ${report.summary.pageErrors}`);

    if (report.all401s.length > 0) {
      console.log('\n--- 401 RESPONSES ---');
      for (const r of report.all401s) {
        console.log(`  ${r.method} ${r.url}`);
      }
    }

    if (report.all403s.length > 0) {
      console.log('\n--- 403 RESPONSES ---');
      for (const r of report.all403s) {
        console.log(`  ${r.method} ${r.url}`);
      }
    }

    if (report.consoleErrors.length > 0) {
      console.log('\n--- CONSOLE ERRORS ---');
      for (const e of report.consoleErrors) {
        console.log(`  ${e.text}`);
      }
    }

    if (report.pageErrors.length > 0) {
      console.log('\n--- UNCAUGHT JS ERRORS ---');
      for (const e of report.pageErrors) {
        console.log(`  ${e.message}`);
      }
    }

    console.log(`\nFull report saved to: ${OUTPUT_DIR}/login-flow-report.md`);
    console.log('========================================\n');
  });

  test('verify downstream service endpoints after login', async ({ page }) => {
    test.skip(!PROD_EMAIL || !PROD_PASSWORD, 'Set PROD_TEST_EMAIL and PROD_TEST_PASSWORD env vars');

    // Login first
    await page.goto('/login');
    await page.waitForURL('**/accounts.codevertexitsolutions.com/**', { timeout: 30_000 });

    const emailInput = page.locator('input[name="email"], input[type="email"], input[id="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"], input[id="password"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(PROD_EMAIL!);
    await passwordInput.fill(PROD_PASSWORD!);
    await page.locator('button[type="submit"]').first().click();

    // Wait for authenticated state
    try {
      await page.waitForURL(url => {
        const pathname = new URL(url).pathname;
        return pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
      }, { timeout: 45_000 });
    } catch {
      console.error('Login failed. Current URL:', page.url());
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'service-test-login-failed.png'), fullPage: true });
      return;
    }

    // Navigate to key dashboard pages to trigger API calls
    const pages = [
      { path: '/dashboard/orders', name: 'orders' },
      { path: '/dashboard/menu', name: 'menu' },
      { path: '/dashboard/inventory', name: 'inventory' },
      { path: '/dashboard/riders', name: 'riders' },
      { path: '/dashboard/payments', name: 'payments' },
    ];

    for (const p of pages) {
      await page.goto(p.path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForTimeout(5_000);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `service-${p.name}.png`),
        fullPage: true,
      });
    }

    // Save the comprehensive service test report
    logger.saveReport(OUTPUT_DIR, 'service-endpoints-report');

    const report = logger.generateReport();
    console.log('\n========================================');
    console.log('SERVICE ENDPOINTS DIAGNOSTIC SUMMARY');
    console.log('========================================');
    console.log(`Total requests: ${report.summary.totalRequests}`);
    console.log(`Failed: ${report.summary.failedRequests}`);
    console.log(`401s: ${report.summary.count401}`);
    console.log(`403s: ${report.summary.count403}`);
    console.log(`5xx: ${report.summary.count5xx}`);

    if (report.failedRequests.length > 0) {
      console.log('\n--- FAILED REQUESTS ---');
      for (const r of report.failedRequests) {
        console.log(`  ${r.status} ${r.method} ${r.url}`);
      }
    }
    console.log('========================================\n');
  });
});
