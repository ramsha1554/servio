const { test, expect } = require('@playwright/test');
const { loginAsUser } = require('../helpers/login');

test.describe('Order Placement', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsUser(page);
    });

    test('should place an order successfully', async ({ page }) => {
        // 1. Add item to cart
        await page.goto('/');
        await page.click('[data-testid="shop-card"] >> nth=0');
        await page.click('[data-testid="add-to-cart-btn"] >> nth=0');
        
        // 2. Go to checkout
        await page.goto('/checkout');
        
        // 3. Fill address
        await page.fill('[data-testid="checkout-address-input"]', '123 Test Street, New Delhi');
        // We might need to click search to trigger geocoding and set lat/lon
        // but for now let's hope the backend allows it or we mock it.
        
        // 4. Place order
        await page.click('[data-testid="checkout-place-order-btn"]');
        
        // 5. Verify confirmation
        await expect(page.locator('[data-testid="order-placed-confirmation"]')).toBeVisible();
        
        // 6. Check in My Orders
        await page.goto('/my-orders');
        await expect(page.locator('[data-testid="user-order-card"]')).first().toBeVisible();
        await expect(page.locator('[data-testid="order-status"]')).first().toHaveText('pending');
    });
});
