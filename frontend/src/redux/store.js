import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"
import cartSlice from "./cartSlice"
import { persistenceMiddleware } from "./persistenceMiddleware"

export const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
        map: mapSlice,
        cart: cartSlice
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(persistenceMiddleware)
})