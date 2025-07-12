import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoriesState {
    selectedCategoryId: string | null;
}

const initialState: CategoriesState = {
    selectedCategoryId: null,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        setSelectedCategoryId: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.selectedCategoryId = action.payload;
        },
    },
});

export const { setSelectedCategoryId } = categoriesSlice.actions;
export default categoriesSlice.reducer;
