const { test, expect } = require('@playwright/test');
const { loginAsUser } = require('../helpers/login');

test.describe('Customer Authentication', () => {
    test('should allow a new user to sign up', async ({ page }) => {
        await page.goto('/signup');
        
        await page.fill('#signup-name', 'Test User');
        const uniqueEmail = `test_${Date.now()}@example.com`;
        await page.fill('#signup-email', uniqueEmail);
        await page.fill('#signup-password', 'password123');
        await page.fill('#signup-mobile', '1234567890');
        
        // Select 'user' role if not default
        await page.click('[data-testid="role-user"]');
        
        await page.click('[data-testid="signup-submit-btn"]');
        
        // Should redirect to signin or home
        await expect(page).toHaveURL(new RegExp(`${process.env.BASE_URL}/?$|.*signin`));
    });

    test('should allow an existing user to sign in', async ({ page }) => {
        await page.goto('/signin');
        
        await page.fill('#signin-email', 'test_customer@servio.test');
        await page.fill('#signin-password', 'Test@1234');
        
        await page.click('[data-testid="signin-submit-btn"]');
        
        // Should redirect to home
        await expect(page).toHaveURL(`${process.env.BASE_URL}/`);
        
        // Wait for avatar to appear (Redux hydration)
        await page.waitForSelector('[data-testid="user-avatar"]', { state: 'visible', timeout: 10000 });
        
        // Nav should show sign out after clicking avatar
        await page.click('[data-testid="user-avatar"]');
        await expect(page.locator('[data-testid="signout-btn"]')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/signin');
        
        await page.fill('#signin-email', 'wrong@example.com');
        await page.fill('#signin-password', 'wrongpass');
        
        await page.click('[data-testid="signin-submit-btn"]');
        
        const errorMsg = page.locator('[data-testid="signin-error-msg"]');
        await expect(errorMsg).toBeVisible();
    });

    test('should allow user to sign out', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/');
        
        await page.click('[data-testid="user-avatar"]');
        await page.click('[data-testid="signout-btn"]');
        
        // Should redirect to home (or signin) and hide signout btn
        await expect(page.locator('[data-testid="user-avatar"]')).not.toBeVisible();
    });
});
