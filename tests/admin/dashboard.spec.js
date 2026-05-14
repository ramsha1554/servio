const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('../helpers/login');

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin');
    });

    test('should show platform stats', async ({ page }) => {
        await expect(page.locator('[data-testid="admin-stats-section"]')).toBeVisible();
    });

    test('should manage users', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page.locator('[data-testid="admin-users-list"]')).toBeVisible();
        
        // Test ban button exists
        await expect(page.locator('[data-testid="ban-user-btn"]').first()).toBeVisible();
    });

    test('should manage shops', async ({ page }) => {
        await page.goto('/admin/shops');
        await expect(page.locator('[data-testid="admin-shops-list"]')).toBeVisible();
        
        // Test verify button exists
        await expect(page.locator('[data-testid="verify-shop-btn"]').first()).toBeVisible();
    });
});
