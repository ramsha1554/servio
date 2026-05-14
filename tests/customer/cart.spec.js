const { test, expect } = require('@playwright/test');
const { loginAsUser } = require('../helpers/login');

test.describe('Cart Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/');
    });

    test('should add an item to the cart', async ({ page }) => {
        // Wait for shops to load
        await page.waitForSelector('[data-testid="shop-card"]');
        
        // Go to first shop
        await page.click('[data-testid="shop-card"] >> nth=0');
        
        // Wait for food cards
        await page.waitForSelector('[data-testid="food-card"]');
        
        const firstFoodName = await page.locator('[data-testid="food-card-name"]').first().textContent();
        
        // Click add to cart
        await page.click('[data-testid="add-to-cart-btn"] >> nth=0');
        
        // Check cart badge in Nav
        const cartCount = page.locator('[data-testid="cart-item-count"]');
        await expect(cartCount).toHaveText('1');
        
        // Go to cart page
        await page.goto('/cart');
        await expect(page.locator('[data-testid="cart-page"]')).toBeVisible();
        await expect(page.locator(`text=${firstFoodName}`)).toBeVisible();
    });

    test('should modify item quantity in cart', async ({ page }) => {
        // Add item first (simpler to just go to cart if items exist, but let's be robust)
        await page.click('[data-testid="shop-card"] >> nth=0');
        await page.click('[data-testid="add-to-cart-btn"] >> nth=0');
        
        await page.goto('/cart');
        
        const initialTotal = await page.locator('[data-testid="cart-grand-total"]').textContent();
        
        // Increment
        await page.click('[data-testid="cart-item-qty-inc"]');
        
        // Wait for total to change
        await expect(page.locator('[data-testid="cart-grand-total"]')).not.toHaveText(initialTotal);
        
        // Decrement
        await page.click('[data-testid="cart-item-qty-dec"]');
        await expect(page.locator('[data-testid="cart-grand-total"]')).toHaveText(initialTotal);
    });

    test('should remove an item from the cart', async ({ page }) => {
        await page.click('[data-testid="shop-card"] >> nth=0');
        await page.click('[data-testid="add-to-cart-btn"] >> nth=0');
        
        await page.goto('/cart');
        await page.click('[data-testid="cart-item-remove-btn"]');
        
        // Should show empty state
        await expect(page.locator('[data-testid="cart-empty-state"]')).toBeVisible();
    });
});
