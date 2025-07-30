import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BlogPostsState {
    selectedCategorySlug: string | null;
    searchTerm: string;
    currentPage: number;
    postsPerPage: number;
}

const initialState: BlogPostsState = {
    selectedCategorySlug: null,
    searchTerm: "",
    currentPage: 1,
    postsPerPage: 10,
};

const blogPostsSlice = createSlice({
    name: "blogPosts",
    initialState,
    reducers: {
        setSelectedCategorySlug: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.selectedCategorySlug = action.payload;
            state.currentPage = 1;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPostsPerPage: (state, action: PayloadAction<number>) => {
            state.postsPerPage = action.payload;
            state.currentPage = 1;
        },
        resetBlogFilters: (state) => {
            state.selectedCategorySlug = null;
            state.searchTerm = "";
            state.currentPage = 1;
        },
    },
});

export const {
    setSelectedCategorySlug,
    setSearchTerm,
    setCurrentPage,
    setPostsPerPage,
    resetBlogFilters,
} = blogPostsSlice.actions;

export default blogPostsSlice.reducer;
