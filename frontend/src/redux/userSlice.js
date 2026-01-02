import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: [],
    itemsInMyCity: [],
    searchItems: [],  
    cartItems: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setState: (state, action) => {
      state.currentState = action.payload;
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    }
    ,
    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    }

  },
});

export const { setUserData, setCity, setState, setCartItems, setShopsInMyCity, setItemsInMyCity, setSearchItems } = userSlice.actions;
export default userSlice.reducer;



