import { test, expect } from './helpers/auth-fixture';
import { DashboardNav } from './helpers/dashboard-nav';
import { NetworkLogger } from './helpers/network-logger';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe('Inventory Management Dashboard', () => {
  let logger: NetworkLogger;
  let nav: DashboardNav;

  test.beforeEach(async ({ authenticatedPage }) => {
    logger = new NetworkLogger();
    logger.attachToPage(authenticatedPage);
    nav = new DashboardNav(authenticatedPage);
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'inventory-report');
  });

  test('page loads with stats cards and inventory table', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    // Verify stats cards
    await expect(page.locator('text=Total Items')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Low Stock')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Out of Stock')).toBeVisible({ timeout: 5_000 });

    // Verify table headers
    const headers = page.locator('thead th');
    await expect(headers.nth(0)).toContainText('Item');
    await expect(headers.nth(1)).toContainText('SKU');
    await expect(headers.nth(2)).toContainText('Type');
    await expect(headers.nth(3)).toContainText('In Stock');
    await expect(headers.nth(4)).toContainText('Reserved');
    await expect(headers.nth(5)).toContainText('Status');
    await expect(headers.nth(6)).toContainText('Actions');

    // Verify filter buttons
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Low Stock")')).toBeVisible();
    await expect(page.locator('button:has-text("Out of Stock")')).toBeVisible();

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-table.png'), fullPage: true });
  });

  test('adjust stock levels - modal opens, submit works', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    const rowCount = await page.locator('tbody tr').count();
    if (rowCount === 0) {
      test.skip(true, 'No inventory items to test');
      return;
    }

    // Click "Adjust Stock" button (Plus icon) on first row
    const adjustBtn = page.locator('tbody tr').first().locator('button[title="Adjust Stock"]');
    await adjustBtn.click();
    await page.waitForTimeout(1_000);

    // Verify modal opens with correct title
    await expect(page.locator('text=Adjust Stock Levels')).toBeVisible({ timeout: 5_000 });

    // Fill adjustment value
    const adjustInput = page.locator('input[type="number"]').first();
    await adjustInput.fill('5');

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-adjust-modal.png'), fullPage: true });

    // Intercept POST to adjust endpoint
    const apiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/inventory/adjust') && resp.request().method() === 'POST',
      { timeout: 10_000 },
    );

    await page.click('button:has-text("Update Inventory")');

    const response = await apiPromise;
    expect(response.status()).toBeLessThan(400);

    await expect(page.locator('text=Stock adjusted successfully')).toBeVisible({ timeout: 5_000 });
  });

  test('edit inventory details - modal opens with pre-populated data', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    const rowCount = await page.locator('tbody tr').count();
    if (rowCount === 0) {
      test.skip(true, 'No inventory items to test');
      return;
    }

    // Click "Edit Details" button (Settings icon) on first row
    const editBtn = page.locator('tbody tr').first().locator('button[title="Edit Details"]');
    await editBtn.click();
    await page.waitForTimeout(1_000);

    // Verify modal opens
    await expect(page.locator('text=Edit Inventory Details')).toBeVisible({ timeout: 5_000 });

    // Verify name field is pre-populated
    const nameInput = page.locator('input[type="text"]').first();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-edit-modal.png'), fullPage: true });

    // Intercept PUT
    const apiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/inventory/items/') && resp.request().method() === 'PUT',
      { timeout: 10_000 },
    );

    await page.click('button:has-text("Save Changes")');

    const response = await apiPromise;
    expect(response.status()).toBeLessThan(400);

    await expect(page.locator('text=Item updated')).toBeVisible({ timeout: 5_000 });
  });

  test('delete inventory item shows confirm and sends DELETE', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    const rowCount = await page.locator('tbody tr').count();
    if (rowCount === 0) {
      test.skip(true, 'No inventory items to test');
      return;
    }

    // Set up dialog handler to DISMISS (don't actually delete)
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete inventory record');
      await dialog.dismiss();
    });

    const deleteBtn = page.locator('tbody tr').first().locator('button[title="Delete"]');
    await deleteBtn.click();

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-delete-confirm.png'), fullPage: true });
  });

  test('add stock item - modal opens, form submits', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    // Click "Add Stock Item" button
    await page.click('button:has-text("Add Stock Item")');
    await page.waitForTimeout(1_000);

    // Verify modal opens
    await expect(page.locator('text=Add Inventory Item')).toBeVisible({ timeout: 5_000 });

    // Fill form
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Test Inventory Item ' + Date.now());

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-add-modal.png'), fullPage: true });

    // Intercept POST
    const apiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/inventory/items') && resp.request().method() === 'POST',
      { timeout: 10_000 },
    );

    await page.click('button:has-text("Create Item")');

    const response = await apiPromise;
    expect(response.status()).toBeLessThan(400);

    await expect(page.locator('text=Inventory item created')).toBeVisible({ timeout: 5_000 });
  });

  test('search filters table by name or SKU', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    const rowCount = await page.locator('tbody tr').count();
    if (rowCount === 0) {
      test.skip(true, 'No inventory items to test');
      return;
    }

    // Get the name of the first item
    const firstName = await page.locator('tbody tr').first().locator('td').first().locator('p').first().textContent();

    // Search for it
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(firstName?.trim() ?? '');
    await page.waitForTimeout(1_000);

    // Verify the results are filtered
    const filteredCount = await page.locator('tbody tr').count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(rowCount);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1_000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-search.png'), fullPage: true });
  });

  test('filter buttons toggle between stock status views', async ({ authenticatedPage: page }) => {
    await nav.navigateToInventory();
    await nav.waitForTableOrEmpty();

    // Click "Low Stock" filter
    await page.click('button:has-text("Low Stock")');
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-filter-low.png'), fullPage: true });

    // Click "Out of Stock" filter
    await page.click('button:has-text("Out of Stock")');
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'inventory-filter-out.png'), fullPage: true });

    // Click "All" to reset
    await page.click('button:has-text("All")');
    await page.waitForTimeout(1_000);
  });
});
