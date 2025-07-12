import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ShippingDetailsState {
    selectedShippingDetailsId: string | null;
}

const initialState: ShippingDetailsState = {
    selectedShippingDetailsId: null,
};

const shippingDetailsSlice = createSlice({
    name: "shippingDetails",
    initialState,
    reducers: {
        setSelectedShippingDetailsId: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.selectedShippingDetailsId = action.payload;
        },
    },
});

export const { setSelectedShippingDetailsId } = shippingDetailsSlice.actions;
export default shippingDetailsSlice.reducer;
