import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PartnerProductsState {
  selectedPartnerProductId: string | null;
}

const initialState: PartnerProductsState = {
  selectedPartnerProductId: null,
};

const partnerProductsSlice = createSlice({
  name: "partnerProducts",
  initialState,
  reducers: {
    setSelectedPartnerProductId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedPartnerProductId = action.payload;
    },
  },
});

export const { setSelectedPartnerProductId } = partnerProductsSlice.actions;
export default partnerProductsSlice.reducer;
