/**
 * Standalone Persistence Middleware for the Logistics Cart.
 * Responsibilities:
 * 1. Listen for cart-related actions.
 * 2. Debounce writes to localStorage to prevent I/O thrashing.
 * 3. Filter out transient UI state (locks, modal triggers).
 * 4. Handle serialization safety.
 */

let debounceTimer = null;

export const persistenceMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Only respond to cart-domain actions
    if (action.type.startsWith('cart/')) {
        // Skip persistence for transient locks
        if (action.type === 'cart/setOperationState') return result;

        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            try {
                const state = store.getState().cart;
                
                // Construct the persistence payload (Exclude transient UI state)
                const persistentPayload = {
                    items: state.items,
                    metadata: state.metadata
                };

                localStorage.setItem('servio_cart_v2', JSON.stringify(persistentPayload));
                
                // Double-write for legacy support during migration phase
                // This ensures existing UI using 'servio_cart' stays in sync
                localStorage.setItem('servio_cart', JSON.stringify(state.items));
                
            } catch (error) {
                console.error("Cart Persistence Failure:", error);
            }
        }, 500);
    }

    return result;
};
