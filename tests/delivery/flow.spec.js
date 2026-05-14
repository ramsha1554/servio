const { test, expect } = require('@playwright/test');
const { loginAsDelivery } = require('../helpers/login');

test.describe('Delivery Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Need to grant location permissions for delivery boy
        await page.context().grantPermissions(['geolocation']);
        await page.context().setGeolocation({ latitude: 28.6139, longitude: 77.2090 });
        
        await loginAsDelivery(page);
        await page.goto('/'); // Redirects to /delivery if role is deliveryBoy
    });

    test('should show delivery dashboard and available assignments', async ({ page }) => {
        await expect(page.locator('[data-testid="delivery-dashboard"]')).toBeVisible();
        
        // Check for assignments or "No Available Orders"
        const noOrders = page.locator('[data-testid="no-assignments-msg"]');
        const assignments = page.locator('[data-testid="assignment-card"]');
        
        await expect(noOrders.or(assignments.first())).toBeVisible();
    });

    // Note: Full flow requires an order to be in 'preparing' state first.
    // This would be better handled by a combined integration test.
});
