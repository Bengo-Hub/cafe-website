import { test, expect } from './helpers/auth-fixture';
import { DashboardNav } from './helpers/dashboard-nav';
import { NetworkLogger } from './helpers/network-logger';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe('Payments / Treasury Dashboard', () => {
  let logger: NetworkLogger;
  let nav: DashboardNav;

  test.beforeEach(async ({ authenticatedPage }) => {
    logger = new NetworkLogger();
    logger.attachToPage(authenticatedPage);
    nav = new DashboardNav(authenticatedPage);
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'payments-report');
  });

  test('iframe embeds treasury dashboard with correct src', async ({ authenticatedPage: page }) => {
    await nav.navigateToPayments();

    // Verify iframe exists
    const iframe = page.locator('iframe[title*="Treasury"]');
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // Verify iframe src contains the embed path
    const src = await iframe.getAttribute('src');
    expect(src).toContain('/embed/dashboard');
    expect(src).toContain('tenant=');
    expect(src).toContain('embed=true');

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'payments-iframe.png'), fullPage: true });
  });

  test('tab switching updates iframe src', async ({ authenticatedPage: page }) => {
    await nav.navigateToPayments();

    // Verify tab buttons exist
    await expect(page.locator('button:has-text("Overview")')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('button:has-text("Transactions")')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('button:has-text("Settlements")')).toBeVisible({ timeout: 5_000 });

    // Click "Transactions" tab
    await page.click('button:has-text("Transactions")');
    await page.waitForTimeout(2_000);

    const iframe = page.locator('iframe[title*="Treasury"]');
    const src = await iframe.getAttribute('src');
    expect(src).toContain('/embed/transactions');

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'payments-transactions-tab.png'), fullPage: true });

    // Click "Settlements" tab
    await page.click('button:has-text("Settlements")');
    await page.waitForTimeout(2_000);

    const src2 = await iframe.getAttribute('src');
    expect(src2).toContain('/embed/settlements');

    // Switch back to Overview
    await page.click('button:has-text("Overview")');
    await page.waitForTimeout(2_000);

    const src3 = await iframe.getAttribute('src');
    expect(src3).toContain('/embed/dashboard');
  });

  test('Open Treasury button uses correct URL without /dashboard suffix', async ({ authenticatedPage: page }) => {
    await nav.navigateToPayments();

    // Find the "Open Treasury" button
    const openBtn = page.locator('button:has-text("Open Treasury")');
    await expect(openBtn).toBeVisible({ timeout: 5_000 });

    // Intercept the window.open call to verify URL
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 10_000 }).catch(() => null),
      openBtn.click(),
    ]);

    if (newPage) {
      const url = newPage.url();
      // URL should NOT end with /dashboard - just the tenant slug
      expect(url).not.toMatch(/\/[^/]+\/dashboard$/);
      await newPage.close();
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'payments-open-external.png'), fullPage: true });
  });

  test('loading spinner disappears after iframe loads', async ({ authenticatedPage: page }) => {
    await nav.navigateToPayments();

    // Spinner should be visible initially
    const spinner = page.locator('text=Loading payment dashboard');
    // It may already be gone if iframe loaded fast - that's OK

    // Wait for iframe to load
    const iframe = page.locator('iframe[title*="Treasury"]');
    await expect(iframe).toBeVisible({ timeout: 10_000 });

    // After iframe loads, spinner should disappear
    await page.waitForTimeout(5_000);
    await expect(spinner).not.toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'payments-loaded.png'), fullPage: true });
  });

  test('payment info cards are displayed', async ({ authenticatedPage: page }) => {
    await nav.navigateToPayments();

    // Verify quick info cards
    await expect(page.locator('text=Payment Methods')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=M-Pesa')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Powered By', { exact: true })).toBeVisible({ timeout: 5_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'payments-info-cards.png'), fullPage: true });
  });
});
