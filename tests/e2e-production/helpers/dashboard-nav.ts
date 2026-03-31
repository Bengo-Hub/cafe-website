import type { Page } from '@playwright/test';

const NAV_TIMEOUT = 30_000;
const LOAD_WAIT = 3_000;

export class DashboardNav {
  constructor(private page: Page) {}

  async navigateToMenu() {
    await this.page.goto('/dashboard/menu', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  async navigateToRecipes() {
    await this.page.goto('/dashboard/recipes', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  async navigateToInventory() {
    await this.page.goto('/dashboard/inventory', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  async navigateToRiders() {
    await this.page.goto('/dashboard/riders', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  async navigateToPayments() {
    await this.page.goto('/dashboard/payments', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  async navigateToAnalytics() {
    await this.page.goto('/dashboard/analytics', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await this.page.waitForTimeout(LOAD_WAIT);
  }

  /**
   * Wait for a data table or empty state to appear, indicating the page has loaded.
   */
  async waitForTableOrEmpty() {
    await this.page.waitForSelector('table tbody tr, [class*="py-20"], [class*="py-12"]', { timeout: 15_000 });
  }
}
