import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductCategoriesState {
  selectedProductCategoryId: string | null;
}

const initialState: ProductCategoriesState = {
  selectedProductCategoryId: null,
};

const productCategoriesSlice = createSlice({
  name: "productCategories",
  initialState,
  reducers: {
    setSelectedProductCategoryId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedProductCategoryId = action.payload;
    },
  },
});

export const { setSelectedProductCategoryId } = productCategoriesSlice.actions;
export default productCategoriesSlice.reducer;
