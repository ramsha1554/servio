import { createSlice } from '@reduxjs/toolkit';

/**
 * Hardened Cart & Logistics Slice.
 * ALL reducers are pure and deterministic. 
 * Timestamps must be injected via action payloads.
 */
const initialState = {
    items: [],
    status: 'IDLE',
    recovery: {
        invalidItems: [],
        previousAnchor: null,
        reason: null
    },
    pendingItem: null, // Transient item awaiting confirmation
    operationState: {
        addPending: false,
        syncPending: false,
        hydrationPending: false
    },
    metadata: {
        lastUpdated: 0,
        version: 2
    }
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Deterministic Hydration/Sync
        setCart: (state, action) => {
            const { items, timestamp } = action.payload;
            state.items = items;
            state.metadata.lastUpdated = timestamp; // Injected, not generated
            state.status = items.length === 0 ? 'EMPTY' : 'ACTIVE';
        },

        setStatus: (state, action) => {
            state.status = action.payload;
        },

        setRecovery: (state, action) => {
            const { invalidItems, previousAnchor, reason } = action.payload;
            state.recovery = {
                invalidItems: invalidItems || [],
                previousAnchor: previousAnchor || null,
                reason: reason || null
            };
            state.status = 'RECOVERY_REQUIRED';
        },

        resolveRecovery: (state) => {
            state.recovery = { invalidItems: [], previousAnchor: null, reason: null };
            state.status = state.items.length === 0 ? 'EMPTY' : 'ACTIVE';
        },

        addItemRaw: (state, action) => {
            const { item, timestamp } = action.payload;
            state.items.push(item);
            state.status = 'ACTIVE';
            state.metadata.lastUpdated = timestamp;
        },

        removeItemRaw: (state, action) => {
            const { id, timestamp } = action.payload;
            state.items = state.items.filter(item => item.id !== id);
            state.metadata.lastUpdated = timestamp;
            if (state.items.length === 0) state.status = 'EMPTY';
        },

        updateQuantityRaw: (state, action) => {
            const { id, quantity, timestamp } = action.payload;
            const item = state.items.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
                state.metadata.lastUpdated = timestamp;
            }
        },

        clearCart: (state, action) => {
            const { timestamp } = action.payload;
            state.items = [];
            state.status = 'EMPTY';
            state.recovery = { invalidItems: [], previousAnchor: null, reason: null };
            state.metadata.lastUpdated = timestamp;
        },

        setOperationState: (state, action) => {
            state.operationState = { ...state.operationState, ...action.payload };
        },

        // Pending Item Orchestration
        setPendingItem: (state, action) => {
            state.pendingItem = action.payload;
            state.status = 'PENDING_CONFIRMATION';
        },

        resetPendingItem: (state) => {
            state.pendingItem = null;
            state.status = state.items.length === 0 ? 'EMPTY' : 'ACTIVE';
        }
    }
});

export const {
    setCart,
    setStatus,
    setRecovery,
    resolveRecovery,
    addItemRaw,
    removeItemRaw,
    updateQuantityRaw,
    clearCart,
    setOperationState,
    setPendingItem,
    resetPendingItem
} = cartSlice.actions;

export default cartSlice.reducer;
