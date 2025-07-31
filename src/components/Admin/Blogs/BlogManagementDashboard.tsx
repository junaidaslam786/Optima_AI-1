"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import {
  useGetBlogPostsQuery,
  useDeleteBlogPostMutation,
} from "@/redux/features/blogPosts/blogPostsApi";
import { useGetBlogCategoriesQuery } from "@/redux/features/blogCategories/blogCategoriesApi";
import {
  setSelectedCategorySlug,
  setSearchTerm,
  setCurrentPage,
  resetBlogFilters,
} from "@/redux/features/blogPosts/blogPostsSlice";
import { BlogPost } from "@/redux/features/blogPosts/blogPostsTypes";
import { Search, Plus, Edit, Trash2, Eye, Filter, X } from "lucide-react";
import Link from "next/link";

const BlogManagementDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedCategorySlug, searchTerm, currentPage, postsPerPage } =
    useSelector((state: RootState) => state.blogPostsUI);

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    post: BlogPost | null;
  }>({ isOpen: false, post: null });

  const {
    data: allPosts,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorDetails,
  } = useGetBlogPostsQuery({
    category_slug: selectedCategorySlug || undefined,
    limit: postsPerPage,
    offset: (currentPage - 1) * postsPerPage,
  });

  const { data: categories, isLoading: categoriesLoading } =
    useGetBlogCategoriesQuery();

  const [
    deleteBlogPostMutation,
    {
      isSuccess: deleteSuccess,
      isError: deleteError,
      error: deleteErrorDetails,
    },
  ] = useDeleteBlogPostMutation();

  const filteredPosts = React.useMemo(() => {
    if (!allPosts) return [];
    if (!searchTerm) return allPosts;

    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.categories?.some((cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [allPosts, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, dispatch]);

  // Handle delete success/error
  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Blog post deleted successfully!");
      setDeleteModal({ isOpen: false, post: null });
    }
    if (deleteError) {
      let errorMessage = "Failed to delete blog post";
      if (deleteErrorDetails) {
        if (
          "message" in deleteErrorDetails &&
          typeof deleteErrorDetails.message === "string"
        ) {
          errorMessage = deleteErrorDetails.message;
        } else if (
          "data" in deleteErrorDetails &&
          typeof deleteErrorDetails.data === "string"
        ) {
          errorMessage = deleteErrorDetails.data;
        }
      }
      toast.error(errorMessage);
    }
  }, [deleteSuccess, deleteError, deleteErrorDetails]);

  const handleDeletePost = async () => {
    if (deleteModal.post) {
      try {
        await deleteBlogPostMutation(deleteModal.post.slug).unwrap();
      } catch (err) {
        console.error("Failed to delete blog post:", err);
      }
    }
  };

  const openDeleteModal = (post: BlogPost) => {
    setDeleteModal({ isOpen: true, post });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, post: null });
  };

  const handleCategoryFilter = (categorySlug: string | null) => {
    dispatch(setSelectedCategorySlug(categorySlug));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const clearFilters = () => {
    setLocalSearchTerm("");
    dispatch(resetBlogFilters());
  };

  if (postsLoading || categoriesLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 bg-secondary/30 border border-secondary text-secondary rounded-lg mx-auto">
        <LoadingSpinner />
        <p className="ml-2 text-secondary">Loading blog posts...</p>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="w-full text-center p-8 bg-red-50 border border-red-200 text-red-600 rounded-lg mx-auto">
        Error:{" "}
        {postsErrorDetails &&
        typeof postsErrorDetails === "object" &&
        "message" in postsErrorDetails &&
        typeof postsErrorDetails.message === "string"
          ? postsErrorDetails.message
          : "Failed to load blog posts"}
      </div>
    );
  }

  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);

  return (
    <div className="w-full container mx-auto p-8 bg-secondary/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-4 md:mb-0">
          Blog Management Dashboard
        </h1>
        <Link href="/admin/blogs/create">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary h-4 w-4" />
            <input
              type="text"
              placeholder="Search posts by title, content, or category..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-secondary" />
            <select
              value={selectedCategorySlug || ""}
              onChange={(e) => handleCategoryFilter(e.target.value || null)}
              className="px-3 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedCategorySlug || searchTerm) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCategorySlug || searchTerm) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Search: &quot;{searchTerm}&quot;
              </span>
            )}
            {selectedCategorySlug && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Category:{" "}
                {categories?.find((c) => c.slug === selectedCategorySlug)?.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-primary">
            Blog Posts ({filteredPosts?.length || 0})
          </h2>
        </div>

        {!filteredPosts || filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-secondary text-lg">
              {searchTerm || selectedCategorySlug
                ? "No posts found matching your filters."
                : "No blog posts found. Create your first post!"}
            </p>
            {!searchTerm && !selectedCategorySlug && (
              <Link href="/admin/blogs/create" className="mt-4 inline-block">
                <Button variant="primary">Create Your First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-secondary/20">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-6 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary">
                        {post.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {post.excerpt && (
                      <p className="text-secondary text-sm mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-tertiary">
                      <span>By {post.author?.name || "Unknown Author"}</span>
                      {post.published_at && (
                        <span>
                          Published:{" "}
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex gap-1">
                          {post.categories.map((category) => (
                            <span
                              key={category.slug}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/blogs/${post.slug}`} target="_blank">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/blogs/edit/${post.slug}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(post)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary/20 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteModal.post?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeletePost}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default withAuth(BlogManagementDashboard, { allowedRoles: ["admin"] });
