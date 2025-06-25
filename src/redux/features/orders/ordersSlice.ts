import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrdersState {
  selectedOrderId: string | null;
}

const initialState: OrdersState = {
  selectedOrderId: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSelectedOrderId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
    },
  },
});

export const { setSelectedOrderId } = ordersSlice.actions;
export default ordersSlice.reducer;
