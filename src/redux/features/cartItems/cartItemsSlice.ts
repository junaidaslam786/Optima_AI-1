import { createSlice } from "@reduxjs/toolkit";

type CartItemsState = object;

const initialState: CartItemsState = {};

const cartItemsSlice = createSlice({
    name: "cartItems",
    initialState,
    reducers: {},
});

export const {} = cartItemsSlice.actions;
export default cartItemsSlice.reducer;
