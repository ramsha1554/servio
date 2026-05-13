import crypto from 'crypto';

/**
 * Generates a stable, deterministic SHA-256 hash of the cart payload.
 * Used for idempotency checks and payload integrity validation.
 * 
 * Includes:
 * 1. Item IDs and Quantities (sorted to ensure stability)
 * 2. Delivery Address string
 * 3. User ID
 */
export const generateCartHash = (userId, cartItems, address) => {
    // 1. Normalize items: Only ID and Quantity matter for the fingerprint
    const normalizedItems = cartItems
        .map(item => ({ id: item.id.toString(), quantity: item.quantity }))
        .sort((a, b) => a.id.localeCompare(b.id));

    // 2. Construct raw fingerprint string
    const rawData = JSON.stringify({
        userId: userId.toString(),
        items: normalizedItems,
        address: address.trim().toLowerCase()
    });

    // 3. Generate SHA-256 Hash
    return crypto
        .createHash('sha256')
        .update(rawData)
        .digest('hex');
};
