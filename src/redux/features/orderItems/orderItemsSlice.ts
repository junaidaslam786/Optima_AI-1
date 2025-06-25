import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItemsState {
  selectedOrderItemId: string | null;
}

const initialState: OrderItemsState = {
  selectedOrderItemId: null,
};

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {
    setSelectedOrderItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderItemId = action.payload;
    },
  },
});

export const { setSelectedOrderItemId } = orderItemsSlice.actions;
export default orderItemsSlice.reducer;
