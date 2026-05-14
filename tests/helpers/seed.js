// helpers/seed.js
require('dotenv').config({ path: '.env.test' });
const API_URL = process.env.API_URL || 'http://localhost:8000';

async function apiPost(path, body, cookieHeader = '') {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function apiGet(path, cookieHeader = '') {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
  });
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status}`);
  return res.json();
}

// Creates a user and returns their cookie + userId
async function createTestUser(role = 'user') {
  const ts = Date.now();
  const email = `testuser_${ts}_${role}@servio.test`;
  const password = 'Test@1234';
  const data = await apiPost('/api/auth/signup', {
    fullName: `Test ${role} ${ts}`,
    email,
    password,
    mobile: '9999999999',
    role,
  });
  // After signup, get token from signin (signup also sets cookie but we need to capture it via fetch)
  const signinRes = await fetch(`${API_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = signinRes.headers.get('set-cookie') || '';
  const token = setCookie.match(/token=([^;]+)/)?.[1] || '';
  const userData = await signinRes.json();
  return { email, password, userId: userData._id, cookie: `token=${token}` };
}

async function createTestCustomer() {
  return createTestUser('user');
}

async function createTestShop() {
  return createTestUser('owner');
}

async function createTestDeliveryPartner() {
  return createTestUser('deliveryBoy');
}

// Seed an order in a known state (requires owner's shopId and customer cookie)
// NOTE: For seeding orders in specific states, call update-status API after placement
async function createTestOrder(customerCookie, shopId, itemId) {
  const deliveryAddress = {
    text: '123 Test Street, Test City',
    latitude: '18.5204',   // Pune coords — adjust to match your seeded shop's city
    longitude: '73.8567',
  };
  const order = await apiPost('/api/order/place-order', {
    cartItems: [{ id: itemId, shop: shopId, name: 'Test Item', price: 100, quantity: 1 }],
    paymentMethod: 'cod',
    deliveryAddress,
    totalAmount: 100,
  }, customerCookie);
  return { orderId: order._id || order.orderId };
}

module.exports = { createTestCustomer, createTestShop, createTestDeliveryPartner, createTestOrder };
