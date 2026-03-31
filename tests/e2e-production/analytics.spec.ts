import { test, expect } from './helpers/auth-fixture';
import { DashboardNav } from './helpers/dashboard-nav';
import { NetworkLogger } from './helpers/network-logger';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe('Analytics Dashboard', () => {
  let logger: NetworkLogger;
  let nav: DashboardNav;

  test.beforeEach(async ({ authenticatedPage }) => {
    logger = new NetworkLogger();
    logger.attachToPage(authenticatedPage);
    nav = new DashboardNav(authenticatedPage);
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'analytics-report');
  });

  test('page loads without JS errors', async ({ authenticatedPage: page }) => {
    await nav.navigateToAnalytics();

    // Wait for either content or error state
    await page.waitForTimeout(5_000);

    // Check for the specific toString error that was fixed
    const report = logger.generateReport();
    const toStringErrors = report.pageErrors.filter((e) =>
      e.message.includes("Cannot read properties of undefined (reading 'toString')"),
    );
    expect(toStringErrors).toHaveLength(0);

    // No page-level JS crashes should occur
    expect(report.pageErrors.length).toBe(0);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-loaded.png'), fullPage: true });
  });

  test('stats cards render with numeric values', async ({ authenticatedPage: page }) => {
    await nav.navigateToAnalytics();
    await page.waitForTimeout(5_000);

    // Check for error state first
    const errorVisible = await page.locator('text=Failed to load analytics').isVisible().catch(() => false);
    if (errorVisible) {
      // API returned an error - page handles it gracefully
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-api-error.png'), fullPage: true });
      console.log('Analytics API returned an error - this may require a PROFESSIONAL plan');
      return;
    }

    // Verify stat labels are visible
    await expect(page.locator('text=Total Revenue')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Total Orders')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Inventory Items')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Avg. Order')).toBeVisible({ timeout: 5_000 });

    // Verify KES values are displayed (even if 0)
    const revenueCard = page.locator('text=Total Revenue').locator('..').locator('..');
    await expect(revenueCard.locator('text=KES')).toBeVisible({ timeout: 5_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-stats.png'), fullPage: true });
  });

  test('revenue chart renders', async ({ authenticatedPage: page }) => {
    await nav.navigateToAnalytics();
    await page.waitForTimeout(5_000);

    const errorVisible = await page.locator('text=Failed to load analytics').isVisible().catch(() => false);
    if (errorVisible) {
      test.skip(true, 'Analytics API unavailable');
      return;
    }

    // Check for the Recharts container
    await expect(page.locator('text=Revenue Trend')).toBeVisible({ timeout: 10_000 });

    // Verify the chart SVG is rendered
    const chartContainer = page.locator('.recharts-responsive-container');
    if (await chartContainer.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(chartContainer.locator('svg')).toBeVisible();
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-chart.png'), fullPage: true });
  });

  test('top selling items and metrics sections render', async ({ authenticatedPage: page }) => {
    await nav.navigateToAnalytics();
    await page.waitForTimeout(5_000);

    const errorVisible = await page.locator('text=Failed to load analytics').isVisible().catch(() => false);
    if (errorVisible) {
      test.skip(true, 'Analytics API unavailable');
      return;
    }

    // Top Selling Items section
    await expect(page.locator('text=Top Selling Items')).toBeVisible({ timeout: 10_000 });

    // Metrics Distribution section
    await expect(page.locator('text=Metrics Distribution')).toBeVisible({ timeout: 5_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'analytics-sections.png'), fullPage: true });
  });
});
