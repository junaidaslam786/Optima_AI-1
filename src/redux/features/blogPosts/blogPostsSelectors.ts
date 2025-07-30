// blogPostsSelectors.ts
import { RootState } from "@/redux/store"; // Assuming RootState is defined here

export const selectSelectedCategorySlug = (state: RootState) =>
  state.blogPostsUI.selectedCategorySlug;

export const selectSearchTerm = (state: RootState) =>
  state.blogPostsUI.searchTerm;

export const selectCurrentPage = (state: RootState) =>
  state.blogPostsUI.currentPage;

export const selectPostsPerPage = (state: RootState) =>
  state.blogPostsUI.postsPerPage;