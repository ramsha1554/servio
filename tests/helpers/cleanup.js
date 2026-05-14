// helpers/cleanup.js
require('dotenv').config({ path: '.env.test' });
const API_URL = process.env.API_URL || 'http://localhost:8000';

// NOTE: Your backend doesn't expose public delete-user or delete-order endpoints.
// Add these two admin-only endpoints to your backend for test cleanup:
//   DELETE /api/admin/users/:userId/force-delete
//   DELETE /api/admin/orders/:orderId/force-delete
// These should only be enabled when NODE_ENV=test.
// Until then, cleanup is done by the test database being separate, or by marking records.

async function deleteUser(userId, adminCookie) {
  if (!userId) return;
  await fetch(`${API_URL}/api/admin/users/${userId}/force-delete`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
}

async function deleteOrder(orderId, adminCookie) {
  if (!orderId) return;
  await fetch(`${API_URL}/api/admin/orders/${orderId}/force-delete`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });
}

module.exports = { deleteUser, deleteOrder };
