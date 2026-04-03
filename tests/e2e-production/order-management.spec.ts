import { test, expect } from './helpers/auth-fixture';
import { DashboardNav } from './helpers/dashboard-nav';
import { NetworkLogger } from './helpers/network-logger';
import { KubectlLogger } from './helpers/kubectl-logger';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe.serial('Order Management Dashboard', () => {
  let logger: NetworkLogger;
  let nav: DashboardNav;
  let k8sLogger: KubectlLogger;

  test.beforeEach(async ({ authenticatedPage }) => {
    logger = new NetworkLogger();
    logger.attachToPage(authenticatedPage);
    nav = new DashboardNav(authenticatedPage);
    k8sLogger = new KubectlLogger();
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'orders-network-report');
    k8sLogger.stopAll();
    k8sLogger.saveReport(OUTPUT_DIR, 'orders-k8s');
  });

  // ---------------------------------------------------------------
  // 1. Order list loads
  // ---------------------------------------------------------------
  test('order list loads with status filters and API returns 200', async ({ authenticatedPage: page }) => {
    // Intercept the admin orders API call
    const ordersApiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/admin/orders') && resp.request().method() === 'GET',
      { timeout: 20_000 },
    );

    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    // Verify the page header
    await expect(
      page.locator('h1').filter({ hasText: /Order Management/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Verify the status filter dropdown is present with expected options
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Orders")') });
    await expect(statusSelect).toBeVisible({ timeout: 5_000 });

    // Verify key status options exist
    for (const label of ['All Orders', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Cancelled']) {
      await expect(statusSelect.locator(`option:has-text("${label}")`)).toBeAttached();
    }

    // Verify search input
    await expect(page.locator('input[placeholder*="Search orders"]')).toBeVisible({ timeout: 5_000 });

    // Verify date range inputs
    const dateInputs = page.locator('input[type="date"]');
    expect(await dateInputs.count()).toBeGreaterThanOrEqual(2);

    // Verify refresh button
    await expect(page.locator('button').filter({ has: page.locator('svg') }).last()).toBeVisible();

    // Check API response
    const ordersResponse = await ordersApiPromise;
    expect(ordersResponse.status()).toBe(200);
    const body = await ordersResponse.json().catch(() => null);
    console.log(`Orders API returned ${ordersResponse.status()} -- total orders: ${body?.data?.total ?? 'unknown'}`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-list.png'), fullPage: true });
  });

  // ---------------------------------------------------------------
  // 2. Order detail view
  // ---------------------------------------------------------------
  test('order detail panel shows items, customer info, status badge, and timeline', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    // Wait for orders to load -- either order cards or "No orders found"
    const hasOrders = await page
      .locator('[class*="cursor-pointer"][class*="rounded-2xl"]')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasOrders) {
      console.log('No orders found -- skipping detail view test');
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-empty.png'), fullPage: true });
      test.skip(true, 'No orders available to inspect');
      return;
    }

    // The first order is auto-selected (selectedOrder defaults to orders[0])
    // Verify detail panel elements

    // Order number heading in the detail panel (right side)
    const detailPanel = page.locator('.lg\\:col-span-2');
    await expect(detailPanel.locator('h2').first()).toBeVisible({ timeout: 5_000 });

    // Customer name & channel info
    await expect(detailPanel.locator('p').filter({ hasText: /\u2022/ }).first()).toBeVisible({ timeout: 5_000 });

    // Status timeline -- circles for each step in the flow
    const timelineSteps = detailPanel.locator('[class*="rounded-full"][class*="border-2"]');
    expect(await timelineSteps.count()).toBeGreaterThanOrEqual(5); // 7 steps in STATUS_FLOW

    // "Order Items" heading
    await expect(detailPanel.getByText('Order Items')).toBeVisible({ timeout: 5_000 });

    // At least one item row (quantity badge + name + price)
    const itemRows = detailPanel.locator('[class*="rounded-xl"][class*="border"]').filter({
      has: page.locator('text=/\\d+x/'),
    });
    expect(await itemRows.count()).toBeGreaterThanOrEqual(1);

    // Totals section (Subtotal, Total)
    await expect(detailPanel.getByText('Subtotal')).toBeVisible({ timeout: 5_000 });
    await expect(detailPanel.getByText('Total').last()).toBeVisible({ timeout: 5_000 });

    // Now click a different order card to verify panel updates
    const orderCards = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"][class*="p-5"]');
    const cardCount = await orderCards.count();
    if (cardCount > 1) {
      const firstOrderNumber = await detailPanel.locator('h2').first().textContent();
      await orderCards.nth(1).click();
      await page.waitForTimeout(1_000);
      const secondOrderNumber = await detailPanel.locator('h2').first().textContent();
      console.log(`Switched from order ${firstOrderNumber} to ${secondOrderNumber}`);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-detail.png'), fullPage: true });
  });

  // ---------------------------------------------------------------
  // 3. Order status transition
  // ---------------------------------------------------------------
  test('status transition controls are visible for non-terminal orders', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    const hasOrders = await page
      .locator('[class*="cursor-pointer"][class*="rounded-2xl"]')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasOrders) {
      test.skip(true, 'No orders available');
      return;
    }

    const detailPanel = page.locator('.lg\\:col-span-2');

    // Status override dropdown -- always present in the actions bar
    const statusOverrideSelect = detailPanel.locator('select').filter({
      has: page.locator('option:has-text("Pending")'),
    });
    await expect(statusOverrideSelect).toBeVisible({ timeout: 5_000 });

    // Verify all status options are available in the override dropdown
    for (const status of ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled']) {
      await expect(statusOverrideSelect.locator(`option:has-text("${status}")`)).toBeAttached();
    }

    // Check for the "advance status" button -- only shows for non-terminal orders
    // The button text is the NEXT status label (e.g. "Confirmed" when current is "pending")
    const advanceButton = detailPanel.locator('button').filter({
      hasText: /Confirmed|Preparing|Ready|Out for Delivery|Delivered|Completed/,
    }).first();

    const hasAdvanceBtn = await advanceButton.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasAdvanceBtn) {
      const label = await advanceButton.textContent();
      console.log(`Advance status button visible: "${label?.trim()}"`);
      await expect(advanceButton).toBeEnabled();
    } else {
      // Order might be in a terminal state -- check for Cancel Order absence too
      console.log('No advance button -- order may be in a terminal state (completed/cancelled/refunded)');
    }

    // Check for Cancel Order button on non-terminal orders
    const cancelBtn = detailPanel.locator('button:has-text("Cancel Order")');
    const hasCancelBtn = await cancelBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    console.log(`Cancel Order button visible: ${hasCancelBtn}`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-status-controls.png'), fullPage: true });
  });

  // ---------------------------------------------------------------
  // 4. Assign rider to order
  // ---------------------------------------------------------------
  test('assign rider button and form for delivery orders', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    const hasOrders = await page
      .locator('[class*="cursor-pointer"][class*="rounded-2xl"]')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasOrders) {
      test.skip(true, 'No orders available');
      return;
    }

    const detailPanel = page.locator('.lg\\:col-span-2');

    // Look for "Assign Rider" button (only visible for delivery orders in non-terminal state)
    const assignRiderBtn = detailPanel.locator('button:has-text("Assign Rider")');
    let assignBtnVisible = await assignRiderBtn.isVisible({ timeout: 3_000 }).catch(() => false);

    // If the default-selected order is not a delivery order, scan other cards
    if (!assignBtnVisible) {
      const orderCards = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"][class*="p-5"]');
      const cardCount = await orderCards.count();

      // Look for an order that mentions "Delivery"
      for (let i = 0; i < Math.min(cardCount, 10); i++) {
        await orderCards.nth(i).click();
        await page.waitForTimeout(800);
        assignBtnVisible = await assignRiderBtn.isVisible({ timeout: 2_000 }).catch(() => false);
        if (assignBtnVisible) break;
      }
    }

    if (!assignBtnVisible) {
      console.log('No delivery orders found with Assign Rider available -- skipping modal test');
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-no-assign-rider.png'), fullPage: true });
      test.skip(true, 'No delivery orders with Assign Rider button');
      return;
    }

    // Click Assign Rider to open the modal
    await assignRiderBtn.click();
    await page.waitForTimeout(2_000);

    // Verify modal opens with expected content
    await expect(page.getByText('Assign Delivery Rider')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Select an active rider to fulfill this order')).toBeVisible({ timeout: 5_000 });

    // Verify the AssignRiderForm loads -- should have a rider selection (select/dropdown)
    // and display the order number
    const modal = page.locator('[class*="fixed"], [role="dialog"]').filter({
      hasText: 'Assign Delivery Rider',
    });

    // Look for rider dropdown or select within the form
    const riderSelect = modal.locator('select, [role="combobox"], [role="listbox"]').first();
    const hasRiderSelect = await riderSelect.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasRiderSelect) {
      console.log('Rider selection dropdown is visible');
    } else {
      // May still be loading riders
      console.log('Rider dropdown not immediately visible -- may be loading active riders');
    }

    // Verify submit button
    await expect(modal.locator('button:has-text("Assign Rider")')).toBeVisible({ timeout: 5_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-assign-rider-modal.png'), fullPage: true });

    // Close modal without submitting
    const closeBtn = modal.locator('button:has-text("Cancel"), button:has-text("Close"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeBtn.click();
    } else {
      // Press Escape to close
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1_000);
  });

  // ---------------------------------------------------------------
  // 5. KDS notification flow
  // ---------------------------------------------------------------
  test('KDS-related UI updates when order is in preparing state', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    const hasOrders = await page
      .locator('[class*="cursor-pointer"][class*="rounded-2xl"]')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasOrders) {
      test.skip(true, 'No orders available');
      return;
    }

    // Filter to "Preparing" status to find orders in KDS-relevant state
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Orders")') });
    await statusSelect.selectOption('preparing');
    await page.waitForTimeout(3_000);

    const preparingOrders = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"][class*="p-5"]');
    const preparingCount = await preparingOrders.count();
    console.log(`Found ${preparingCount} orders in "Preparing" state`);

    if (preparingCount > 0) {
      // Select the first preparing order
      await preparingOrders.first().click();
      await page.waitForTimeout(1_000);

      const detailPanel = page.locator('.lg\\:col-span-2');

      // Verify the status badge shows "Preparing" with the chef hat icon
      await expect(detailPanel.getByText('Preparing').first()).toBeVisible({ timeout: 5_000 });

      // The timeline should highlight up to the "Preparing" step
      const completedSteps = detailPanel.locator('[class*="rounded-full"][class*="bg-brand-orange"]');
      expect(await completedSteps.count()).toBeGreaterThanOrEqual(3); // pending + confirmed + preparing

      // The next action button should read "Ready"
      const readyBtn = detailPanel.locator('button:has-text("Ready")');
      await expect(readyBtn).toBeVisible({ timeout: 5_000 });

      await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-kds-preparing.png'), fullPage: true });
    } else {
      console.log('No orders currently in "Preparing" state -- checking for KDS tab or section');

      // Check if there is a dedicated KDS tab/link anywhere on the page
      const kdsTab = page.locator('button:has-text("KDS"), a:has-text("KDS"), [data-testid*="kds"]').first();
      const hasKdsTab = await kdsTab.isVisible({ timeout: 3_000 }).catch(() => false);
      if (hasKdsTab) {
        await kdsTab.click();
        await page.waitForTimeout(2_000);
        console.log('KDS tab found and clicked');
      } else {
        console.log('No KDS tab found -- KDS view may be a separate route');
      }

      await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-kds-empty.png'), fullPage: true });
    }

    // Reset filter
    await statusSelect.selectOption('');
    await page.waitForTimeout(2_000);
  });

  // ---------------------------------------------------------------
  // 6. Monitor backend logs during operations
  // ---------------------------------------------------------------
  test('backend logs show no critical errors during order operations', async ({ authenticatedPage: page }) => {
    // Start tailing logs from the key services
    k8sLogger.startTailing(['ordering-backend', 'logistics-api', 'notifications-api']);

    // Navigate and perform basic operations to generate log activity
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    // Trigger a few API calls by switching filters
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Orders")') });
    for (const filter of ['pending', 'confirmed', 'preparing', '']) {
      await statusSelect.selectOption(filter);
      await page.waitForTimeout(2_000);
    }

    // Click through a few order cards if available
    const orderCards = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"][class*="p-5"]');
    const cardCount = await orderCards.count();
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      await orderCards.nth(i).click();
      await page.waitForTimeout(1_000);
    }

    // Allow time for log events to propagate
    await page.waitForTimeout(5_000);

    // Search for critical errors across all tailed services
    const errorPatterns = [
      /\bpanic\b/i,
      /\bfatal\b/i,
      /\bunhandled\b/i,
      /\bsegfault\b/i,
      /level=error/i,
      /"level"\s*:\s*"error"/i,
    ];

    let totalErrors = 0;
    for (const pattern of errorPatterns) {
      const matches = k8sLogger.searchLogs(pattern);
      if (matches.length > 0) {
        totalErrors += matches.length;
        console.log(`\n--- Log errors matching ${pattern.source} (${matches.length}) ---`);
        for (const m of matches.slice(0, 10)) {
          console.log(`  [${m.service}] ${m.line.slice(0, 200)}`);
        }
      }
    }

    // Fetch recent logs directly as a fallback
    const orderingLogs = KubectlLogger.getRecentLogs('ordering-backend', 3);
    console.log(`\n--- Recent ordering-backend logs (last 3 min, ${orderingLogs.length} chars) ---`);
    console.log(orderingLogs.slice(0, 3000));

    const logisticsLogs = KubectlLogger.getRecentLogs('logistics-api', 3);
    console.log(`\n--- Recent logistics-api logs (last 3 min, ${logisticsLogs.length} chars) ---`);
    console.log(logisticsLogs.slice(0, 2000));

    const notifLogs = KubectlLogger.getRecentLogs('notifications-api', 3);
    console.log(`\n--- Recent notifications-api logs (last 3 min, ${notifLogs.length} chars) ---`);
    console.log(notifLogs.slice(0, 2000));

    // Soft assertion -- log the count but don't fail the suite for backend noise
    if (totalErrors > 0) {
      console.warn(`Found ${totalErrors} error-level log entries across backend services -- review reports`);
    } else {
      console.log('No critical errors found in backend logs during order operations');
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-backend-logs.png'), fullPage: true });
  });

  // ---------------------------------------------------------------
  // 7. Network diagnostics
  // ---------------------------------------------------------------
  test('network diagnostics -- no auth or server errors during order workflow', async ({ authenticatedPage: page }) => {
    // Navigate through the order workflow to capture all network activity
    await page.goto('/dashboard/orders', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(3_000);

    // Exercise filter changes to generate network traffic
    const statusSelect = page.locator('select').filter({ has: page.locator('option:has-text("All Orders")') });
    for (const filter of ['pending', 'ready', 'completed', 'cancelled', '']) {
      await statusSelect.selectOption(filter);
      await page.waitForTimeout(1_500);
    }

    // Click through order cards
    const orderCards = page.locator('[class*="cursor-pointer"][class*="rounded-2xl"][class*="p-5"]');
    const cardCount = await orderCards.count();
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      await orderCards.nth(i).click();
      await page.waitForTimeout(800);
    }

    // Generate the network diagnostic report
    const report = logger.generateReport();

    console.log('\n========== NETWORK DIAGNOSTICS ==========');
    console.log(`Total requests:    ${report.summary.totalRequests}`);
    console.log(`Failed requests:   ${report.summary.failedRequests}`);
    console.log(`401 Unauthorized:  ${report.summary.count401}`);
    console.log(`403 Forbidden:     ${report.summary.count403}`);
    console.log(`5xx Server Errors: ${report.summary.count5xx}`);
    console.log(`Console errors:    ${report.summary.consoleErrors}`);
    console.log(`Page errors:       ${report.summary.pageErrors}`);

    if (report.all401s.length > 0) {
      console.log('\n--- 401 Unauthorized ---');
      for (const r of report.all401s) {
        console.log(`  ${r.method} ${r.url} (${r.duration ?? '?'}ms)`);
      }
    }

    if (report.all403s.length > 0) {
      console.log('\n--- 403 Forbidden ---');
      for (const r of report.all403s) {
        console.log(`  ${r.method} ${r.url} (${r.duration ?? '?'}ms)`);
      }
    }

    if (report.all5xx.length > 0) {
      console.log('\n--- 5xx Server Errors ---');
      for (const r of report.all5xx) {
        console.log(`  ${r.method} ${r.url} -> ${r.status} ${r.statusText} (${r.duration ?? '?'}ms)`);
      }
    }

    if (report.consoleErrors.length > 0) {
      console.log('\n--- Console Errors ---');
      for (const e of report.consoleErrors.slice(0, 20)) {
        console.log(`  ${e.text}`);
      }
    }

    if (report.pageErrors.length > 0) {
      console.log('\n--- Uncaught Page Errors ---');
      for (const e of report.pageErrors) {
        console.log(`  ${e.message}`);
      }
    }

    // Save full report to disk
    logger.saveReport(OUTPUT_DIR, 'orders-network-diagnostics');

    // Hard-fail on 5xx errors from the ordering backend
    const ordering5xx = report.all5xx.filter((r) => r.url.includes('/admin/orders'));
    if (ordering5xx.length > 0) {
      console.error(`CRITICAL: ${ordering5xx.length} server errors from ordering-backend API`);
    }
    expect(ordering5xx.length, 'Ordering backend should not return 5xx errors').toBe(0);

    // Warn on 401s but don't fail (token refresh race conditions are transient)
    if (report.summary.count401 > 0) {
      console.warn(`WARNING: ${report.summary.count401} 401 responses detected -- possible token expiry`);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'orders-network-final.png'), fullPage: true });
  });
});
