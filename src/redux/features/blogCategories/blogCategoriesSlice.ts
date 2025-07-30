import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BlogCategoriesState {
    selectedCategoryId: string | null;
}

const initialState: BlogCategoriesState = {
    selectedCategoryId: null,
};

const blogCategoriesSlice = createSlice({
    name: "blogCategories",
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

export const { setSelectedCategoryId } = blogCategoriesSlice.actions;

export default blogCategoriesSlice.reducer;
