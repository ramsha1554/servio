const { test, expect } = require('@playwright/test');
const { loginAsOwner } = require('../helpers/login');

test.describe('Shop Order Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsOwner(page);
        await page.goto('/my-orders'); // Owners see their orders here too
    });

    test('should allow owner to update order status', async ({ page }) => {
        // Find the first order card
        const orderCard = page.locator('[data-testid="owner-order-card"]').first();
        await expect(orderCard).toBeVisible();
        
        // Check current status
        const statusSpan = orderCard.locator('[data-testid="owner-order-status"]');
        
        // Change status to 'preparing'
        const select = orderCard.locator('[data-testid="owner-status-select"]');
        await select.selectOption('preparing');
        
        // Verify status updated in UI
        await expect(statusSpan).toHaveText('preparing');
    });
});
