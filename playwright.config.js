// playwright.config.js
const { defineConfig } = require('@playwright/test');
require('dotenv').config({ path: '.env.test' });

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10000,
  },
  retries: 0,
  reporter: 'html',
});
