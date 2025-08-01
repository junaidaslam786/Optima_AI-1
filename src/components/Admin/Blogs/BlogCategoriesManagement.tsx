"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import {
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} from "@/redux/features/blogCategories/blogCategoriesApi";
import {
  BlogCategory,
  CreateBlogCategory,
  UpdateBlogCategory,
} from "@/redux/features/blogCategories/blogCategoriesTypes";
import { Plus, Edit, Trash2, Tag, X, Save, Hash } from "lucide-react";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

const BlogCategoriesManagement: React.FC = () => {
  const { selectedCategoryId } = useSelector(
    (state: RootState) => state.blogCategoriesUI
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: BlogCategory | null;
  }>({ isOpen: false, category: null });

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetails,
  } = useGetBlogCategoriesQuery();

  // Mutations
  const [
    createCategoryMutation,
    {
      isLoading: isCreating,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreateBlogCategoryMutation();

  const [
    updateCategoryMutation,
    {
      isLoading: isUpdating,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateBlogCategoryMutation();

  const [
    deleteCategoryMutation,
    {
      isSuccess: deleteSuccess,
      isError: deleteError,
      error: deleteErrorDetails,
    },
  ] = useDeleteBlogCategoryMutation();

  useEffect(() => {
    if (formData.name && !editingCategory) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingCategory]);

  useEffect(() => {
    if (createSuccess) {
      toast.success("Category created successfully!");
      resetForm();
    }
    if (updateSuccess) {
      toast.success("Category updated successfully!");
      resetForm();
    }
    if (deleteSuccess) {
      toast.success("Category deleted successfully!");
      setDeleteModal({ isOpen: false, category: null });
    }

    const handleError = (error: unknown, action: string) => {
      if (error) {
        let errorMessage = `Failed to ${action} category`;
        if (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            errorMessage = error.message;
          } else if (
            typeof error === "object" &&
            error !== null &&
            "data" in error &&
            typeof error.data === "string"
          ) {
            errorMessage = error.data;
          }
        }
        toast.error(errorMessage);
      }
    };

    handleError(createErrorDetails, "create");
    handleError(updateErrorDetails, "update");
    handleError(deleteErrorDetails, "delete");
  }, [
    createSuccess,
    updateSuccess,
    deleteSuccess,
    createError,
    updateError,
    deleteError,
    createErrorDetails,
    updateErrorDetails,
    deleteErrorDetails,
  ]);

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setFormErrors({});
    setShowCreateForm(false);
    setEditingCategory(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof CategoryFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Check for duplicate slug (exclude current category if editing)
    if (categories) {
      const duplicateSlug = categories.find(
        (cat) => cat.slug === formData.slug && cat.id !== editingCategory?.id
      );
      if (duplicateSlug) {
        errors.slug = "This slug is already in use";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      if (editingCategory) {
        const updateData: UpdateBlogCategory = {
          id: editingCategory.id,
          ...formData,
        };
        await updateCategoryMutation(updateData).unwrap();
      } else {
        const createData: CreateBlogCategory = formData;
        await createCategoryMutation(createData).unwrap();
      }
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async () => {
    if (deleteModal.category) {
      try {
        await deleteCategoryMutation(deleteModal.category.id).unwrap();
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  const openDeleteModal = (category: BlogCategory) => {
    setDeleteModal({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  if (categoriesLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 bg-secondary/30 border border-secondary text-secondary rounded-lg mx-auto">
        <LoadingSpinner />
        <p className="ml-2 text-secondary">Loading categories...</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="w-full text-center p-8 bg-red-50 border border-red-200 text-red-600 rounded-lg mx-auto">
        Error:{" "}
        {categoriesErrorDetails &&
        typeof categoriesErrorDetails === "object" &&
        "message" in categoriesErrorDetails &&
        typeof categoriesErrorDetails.message === "string"
          ? categoriesErrorDetails.message
          : "Failed to load categories"}
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-4 md:mb-0">
          Blog Categories Management
        </h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary/20">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Tag size={20} />
                Categories ({categories?.length || 0})
              </h2>
            </div>

            {!categories || categories.length === 0 ? (
              <div className="p-8 text-center">
                <Tag size={48} className="mx-auto text-secondary/50 mb-4" />
                <p className="text-secondary text-lg mb-4">
                  No categories found. Create your first category!
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-secondary/20">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-6 hover:bg-secondary/5 transition-colors ${
                      selectedCategoryId === category.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-primary">
                            {category.name}
                          </h3>
                          <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full flex items-center gap-1">
                            <Hash size={12} />
                            {category.slug}
                          </span>
                        </div>

                        {category.description && (
                          <p className="text-secondary text-sm mb-2">
                            {category.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-tertiary">
                          <span>
                            Created:{" "}
                            {new Date(category.created_at).toLocaleDateString()}
                          </span>
                          {category.updated_at !== category.created_at && (
                            <span>
                              Updated:{" "}
                              {new Date(
                                category.updated_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(category)}
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
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetForm}
                  className="flex items-center gap-1"
                >
                  <X size={14} />
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      formErrors.name ? "border-red-500" : "border-secondary/30"
                    }`}
                    placeholder="Enter category name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      formErrors.slug ? "border-red-500" : "border-secondary/30"
                    }`}
                    placeholder="category-url-slug"
                  />
                  {formErrors.slug && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.slug}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-tertiary">
                    Used in URLs. Only lowercase letters, numbers, and hyphens
                    allowed.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Brief description of this category"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isCreating || isUpdating}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone and may affect blog posts using this category.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default withAuth(BlogCategoriesManagement, { allowedRoles: ["admin"] });
