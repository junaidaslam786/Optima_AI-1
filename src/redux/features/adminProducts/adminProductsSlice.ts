import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminProductsState {
  selectedAdminProductId: string | null;
}

const initialState: AdminProductsState = {
  selectedAdminProductId: null,
};

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    setSelectedAdminProductId: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedAdminProductId = action.payload;
    },
  },
});

export const { setSelectedAdminProductId } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;
