// helpers/login.js
require('dotenv').config({ path: '.env.test' });

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Credentials for stable pre-seeded test accounts
// Create these in your DB manually (or via seed script) and store here
const CREDENTIALS = {
  customer:  { email: 'test_customer@servio.test',  password: 'Test@1234' },
  owner:     { email: 'test_owner@servio.test',     password: 'Test@1234' },
  delivery:  { email: 'test_delivery@servio.test',  password: 'Test@1234' },
  admin:     { email: 'test_admin@servio.test',     password: 'Test@1234' },
};

async function loginAs(page, role) {
  const creds = CREDENTIALS[role];
  await page.goto(`${BASE_URL}/signin`);

  // Use the id attributes already in SignIn.jsx
  await page.locator('#signin-email').fill(creds.email);
  await page.locator('#signin-password').fill(creds.password);
  await page.locator('[data-testid="signin-submit-btn"]').click();

  // Wait for redirect away from /signin (cookie is set, Redux hydrated)
  await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 10000 });
  return page;
}

async function loginAsCustomer(page) { return loginAs(page, 'customer'); }
async function loginAsShop(page)     { return loginAs(page, 'owner'); }
async function loginAsDelivery(page) { return loginAs(page, 'delivery'); }
async function loginAsAdmin(page)    { return loginAs(page, 'admin'); }

module.exports = { 
  loginAsUser: loginAsCustomer, 
  loginAsCustomer, 
  loginAsOwner: loginAsShop, 
  loginAsShop, 
  loginAsDelivery, 
  loginAsAdmin 
};
