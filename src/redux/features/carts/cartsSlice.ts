import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartsState {
    selectedCartId: string | null;
}

const initialState: CartsState = {
    selectedCartId: null,
};

const cartsSlice = createSlice({
    name: "carts",
    initialState,
    reducers: {
        setSelectedCartId: (state, action: PayloadAction<string | null>) => {
            state.selectedCartId = action.payload;
        },
    },
});

export const { setSelectedCartId } = cartsSlice.actions;
export default cartsSlice.reducer;
