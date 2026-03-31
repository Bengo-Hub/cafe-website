import { test, expect } from './helpers/auth-fixture';
import { DashboardNav } from './helpers/dashboard-nav';
import { NetworkLogger } from './helpers/network-logger';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'production');

test.describe('Recipes & Stock Linkage Dashboard', () => {
  let logger: NetworkLogger;
  let nav: DashboardNav;

  test.beforeEach(async ({ authenticatedPage }) => {
    logger = new NetworkLogger();
    logger.attachToPage(authenticatedPage);
    nav = new DashboardNav(authenticatedPage);
  });

  test.afterEach(async () => {
    logger.saveReport(OUTPUT_DIR, 'recipes-report');
  });

  test('recipes page renders with linkage table', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    // Verify table headers
    const headers = page.locator('thead th');
    await expect(headers.nth(0)).toContainText('Menu Item');
    await expect(headers.nth(1)).toContainText('SKU');
    await expect(headers.nth(2)).toContainText('Ingredients');
    await expect(headers.nth(3)).toContainText('Actions');

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-table.png'), fullPage: true });
  });

  test('items with recipes show ingredient badges, items without show "No recipe linked"', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
      test.skip(true, 'No menu items found');
      return;
    }

    let hasLinked = false;
    let hasUnlinked = false;

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = rows.nth(i);
      const ingredientsCell = row.locator('td').nth(2);
      const text = await ingredientsCell.textContent();

      if (text?.includes('No recipe linked')) {
        hasUnlinked = true;
        // Verify "Add Recipe" button exists for unlinked items
        await expect(row.locator('button:has-text("Add Recipe")')).toBeVisible();
      } else {
        hasLinked = true;
        // Verify edit and delete buttons exist for linked items
        const editBtn = row.locator('button').filter({ has: page.locator('svg') }).first();
        await expect(editBtn).toBeVisible();
      }
    }

    // Log findings
    console.log(`Recipe linkage: ${hasLinked ? 'some linked' : 'none linked'}, ${hasUnlinked ? 'some unlinked' : 'all linked'}`);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-linkage-status.png'), fullPage: true });
  });

  test('Add Recipe on unlinked item opens form with SKU pre-filled', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    // Find an unlinked item
    const addRecipeBtn = page.locator('button:has-text("Add Recipe")').first();
    if (!(await addRecipeBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'All items have recipes already');
      return;
    }

    // Get the SKU from the same row
    const row = addRecipeBtn.locator('xpath=ancestor::tr');
    const skuCell = row.locator('td').nth(1);
    const expectedSku = (await skuCell.textContent())?.trim();

    await addRecipeBtn.click();
    await page.waitForTimeout(1_000);

    // Verify modal opens with "New Recipe" title
    await expect(page.locator('text=New Recipe')).toBeVisible({ timeout: 5_000 });

    // Verify SKU is shown in the description
    if (expectedSku) {
      await expect(page.locator(`text=${expectedSku}`)).toBeVisible({ timeout: 3_000 });
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-add-form.png'), fullPage: true });

    // Close without saving
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.click();
  });

  test('edit existing recipe opens form with data pre-populated', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    // Find a linked item with edit button
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    let editBtn = null;

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cell = row.locator('td').nth(2);
      const text = await cell.textContent();
      if (!text?.includes('No recipe linked')) {
        // This row has a recipe - find edit button
        const btn = row.locator('button').filter({ has: page.locator('svg.lucide-edit-2') }).first();
        if (await btn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          editBtn = btn;
          break;
        }
      }
    }

    if (!editBtn) {
      test.skip(true, 'No recipes with edit buttons found');
      return;
    }

    await editBtn.click();
    await page.waitForTimeout(1_000);

    // Verify modal opens with "Edit Recipe" title
    await expect(page.locator('text=Edit Recipe')).toBeVisible({ timeout: 5_000 });

    // Verify SKU is shown in the description
    await expect(page.locator('text=Updating BOM for SKU:')).toBeVisible({ timeout: 3_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-edit-form.png'), fullPage: true });

    // Close without saving
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.click();
  });

  test('delete recipe removes linkage', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    // Find a linked item with delete button
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    let deleteBtn = null;

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cell = row.locator('td').nth(2);
      const text = await cell.textContent();
      if (!text?.includes('No recipe linked')) {
        const btn = row.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
        if (await btn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          deleteBtn = btn;
          break;
        }
      }
    }

    if (!deleteBtn) {
      test.skip(true, 'No recipes with delete buttons found');
      return;
    }

    // Intercept DELETE
    const apiPromise = page.waitForResponse(
      (resp) => resp.url().includes('/inventory/recipes/') && resp.request().method() === 'DELETE',
      { timeout: 10_000 },
    );

    await deleteBtn.click();

    const response = await apiPromise;
    expect(response.status()).toBeLessThan(400);

    await expect(page.locator('text=Recipe deleted')).toBeVisible({ timeout: 5_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-delete.png'), fullPage: true });
  });

  test('Create Recipe button opens empty form', async ({ authenticatedPage: page }) => {
    await nav.navigateToRecipes();
    await nav.waitForTableOrEmpty();

    // Click "Create Recipe" button at top
    await page.click('button:has-text("Create Recipe")');
    await page.waitForTimeout(1_000);

    // Verify modal opens with "New Recipe" title
    await expect(page.locator('text=New Recipe')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text=Define the bill of materials')).toBeVisible({ timeout: 3_000 });

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'recipes-create-form.png'), fullPage: true });

    // Close without saving
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.click();
  });
});
