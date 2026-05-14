import { 
    setCart, 
    setRecovery, 
    setOperationState,
    setPendingItem,
    resetPendingItem,
    addItemRaw,
    clearCart,
    removeItemRaw,
    resolveRecovery
} from './cartSlice';
import { calculateDistance, isWithinCluster } from '../utils/geoUtils';
import axios from 'axios';
import { serverUrl } from '../App';

/**
 * Revalidate cart item prices and availability against the Database.
 */
export const revalidateCartPrices = () => async (dispatch, getState) => {
    const { items } = getState().cart;
    if (items.length === 0) return;

    dispatch(setOperationState({ hydrationPending: true }));
    try {
        const ids = items.map(i => i.id || i._id);
        const response = await axios.post(`${serverUrl}/api/item/get-bulk`, { ids }, { withCredentials: true });
        const dbItems = response.data;
        const dbItemMap = new Map(dbItems.map(item => [item._id.toString(), item]));

        const updatedItems = items.map(item => {
            const dbItem = dbItemMap.get(item.id || item._id);
            if (!dbItem) return null; // Flag for removal
            
            return {
                ...item,
                price: dbItem.price,
                name: dbItem.name,
                image: dbItem.image
            };
        }).filter(Boolean);

        if (updatedItems.length !== items.length) {
            // Some items were removed from DB
            dispatch(setCart({ items: updatedItems, timestamp: Date.now() }));
        } else {
            // Check if any prices changed
            const hasChanges = updatedItems.some((item, index) => item.price !== items[index].price);
            if (hasChanges) {
                dispatch(setCart({ items: updatedItems, timestamp: Date.now() }));
            }
        }
    } catch (error) {
        console.error("Cart revalidation failed:", error);
    } finally {
        dispatch(setOperationState({ hydrationPending: false }));
    }
};

/**
 * The Authoritative Orchestration Thunk for adding items to the cart.
 */
export const addToCartValidated = (item) => (dispatch, getState) => {
    dispatch(setOperationState({ addPending: true }));
    
    const { items } = getState().cart;
    
    // 1. Anchor Policy: First item defines the cluster
    if (items.length === 0) {
        dispatch(addItemRaw({ item, timestamp: Date.now() }));
        dispatch(setOperationState({ addPending: false }));
        return;
    }
    
    // 2. Cluster Validation
    const anchorShop = items[0].shop;
    const isSafe = isWithinCluster(anchorShop.location, item.shop?.location);
    
    if (isSafe) {
        dispatch(addItemRaw({ item, timestamp: Date.now() }));
    } else {
        // Intercept: Set transient pending state
        dispatch(setPendingItem(item));
    }
    
    dispatch(setOperationState({ addPending: false }));
};

/**
 * Handle "Clear Cart & Continue" from the Cluster Modal.
 */
export const confirmPendingAddition = () => (dispatch, getState) => {
    const { pendingItem } = getState().cart;
    if (!pendingItem) return;

    dispatch(setOperationState({ addPending: true }));
    
    // Atomic transition: Clear old cluster, start new one with pending item
    dispatch(clearCart({ timestamp: Date.now() }));
    dispatch(addItemRaw({ item: pendingItem, timestamp: Date.now() }));
    dispatch(resetPendingItem());
    
    dispatch(setOperationState({ addPending: false }));
};

/**
 * Handle "Cancel" from the Cluster Modal.
 */
export const cancelPendingAddition = () => (dispatch) => {
    dispatch(resetPendingItem());
};

/**
 * Handle item removal with automatic anchor re-validation.
 * If the anchor (index 0) is removed, the next item becomes the anchor.
 * All subsequent items are audited against the new anchor.
 */
export const removeItemWithRevalidation = (id) => (dispatch, getState) => {
    // 1. Perform raw removal
    dispatch(removeItemRaw({ id, timestamp: Date.now() }));
    
    const { items } = getState().cart;
    
    // 2. If cart is now empty, return to IDLE/EMPTY
    if (items.length === 0) {
        dispatch(resolveRecovery());
        return;
    }

    // 3. Re-audit against the NEW anchor (the current items[0])
    const anchorShop = items[0].shop;
    const validItems = [items[0]];
    const invalidItems = [];

    for (let i = 1; i < items.length; i++) {
        const dist = calculateDistance(anchorShop.location, items[i].shop?.location);
        if (dist > 3.05) {
            invalidItems.push({
                ...items[i],
                distanceFromAnchor: dist
            });
        } else {
            validItems.push(items[i]);
        }
    }

    // 4. Enter Recovery if the new cluster is broken
    if (invalidItems.length > 0) {
        dispatch(setRecovery({
            invalidItems,
            previousAnchor: null, // No "Undo" possible here as the shop was explicitly removed
            reason: 'ANCHOR_REMOVAL_REVALIDATION'
        }));
    } else {
        dispatch(resolveRecovery());
    }
};

/**
 * Thunk to hydrate the cart from localStorage on app startup.
 * Handles migration from V1 (Array) to V2 (Structured) and initial cluster audit.
 */
export const hydrateCartThunk = () => async (dispatch) => {
    dispatch(setOperationState({ hydrationPending: true }));
    
    try {
        const rawData = localStorage.getItem('servio_cart_v2');
        let cartData = rawData ? JSON.parse(rawData) : null;

        // 1. Migration Logic (V1 to V2)
        if (!cartData) {
            const legacyData = localStorage.getItem('servio_cart');
            if (legacyData) {
                const legacyItems = JSON.parse(legacyData);
                cartData = {
                    items: legacyItems,
                    metadata: { version: 2, lastUpdated: Date.now() }
                };
            }
        }

        if (!cartData || !cartData.items || cartData.items.length === 0) {
            dispatch(setCart({ items: [], timestamp: Date.now() }));
            return;
        }

        // 2. Initial Cluster Audit (Hardened Preservation-First)
        const items = cartData.items;
        const anchorShop = items[0].shop;
        
        const validItems = [items[0]];
        const invalidItems = [];

        for (let i = 1; i < items.length; i++) {
            const dist = calculateDistance(anchorShop.location, items[i].shop?.location);
            if (dist > 3.05) { // 3KM + 50m buffer
                invalidItems.push({
                    ...items[i],
                    distanceFromAnchor: dist
                });
            } else {
                validItems.push(items[i]);
            }
        }

        const timestamp = cartData.metadata.lastUpdated || Date.now();

        // 3. Commit Hydration
        if (invalidItems.length > 0) {
            // Preservation-first: Keep all items in state but trigger RECOVERY_REQUIRED
            dispatch(setCart({ items: [...validItems, ...invalidItems], timestamp }));
            dispatch(setRecovery({
                invalidItems,
                previousAnchor: anchorShop,
                reason: 'HYDRATION_AUDIT_FAILURE'
            }));
        } else {
            dispatch(setCart({ items: validItems, timestamp }));
        }

    } catch (error) {
        console.error("Cart Hydration Failed:", error);
        localStorage.removeItem('servio_cart_v2');
        dispatch(setCart({ items: [], timestamp: Date.now() }));
    } finally {
        dispatch(setOperationState({ hydrationPending: false }));
    }
};

/**
 * Thunk to sync state from another tab's storage event.
 */
export const syncFromStorageThunk = (payload) => (dispatch, getState) => {
    const currentState = getState().cart;
    
    if (!payload || !payload.metadata) return;

    if (payload.metadata.lastUpdated <= currentState.metadata.lastUpdated) {
        return;
    }

    dispatch(setOperationState({ syncPending: true }));
    
    dispatch(setCart({ 
        items: payload.items, 
        timestamp: payload.metadata.lastUpdated 
    }));
    
    dispatch(setOperationState({ syncPending: false }));
};
