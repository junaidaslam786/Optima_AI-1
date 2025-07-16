"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/categories/categoriesApi";
import { Category } from "@/redux/features/categories/categoriesTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const CategoryList: React.FC = () => {
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Helper for error messages
  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";
    if ("status" in error) {
      const fetchError = error as FetchBaseQueryError;
      return typeof fetchError.data === "object" &&
        fetchError.data !== null &&
        "error" in fetchError.data &&
        typeof fetchError.data.error === "string"
        ? fetchError.data.error
        : `API Error: ${fetchError.status}`;
    } else if ("message" in error) {
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load categories: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load categories: ${getErrorMessage(error)}`,
      });
    }
  }, [isError, error]);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      await createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
      }).unwrap();
      toast.success("Category created successfully!");
      setAlert({ type: "success", message: "Category created successfully!" });
      setNewCategoryName("");
      setNewCategoryDescription("");
      refetch();
    } catch (err: unknown) {
      console.error("Failed to create category:", err);
      toast.error(
        `Failed to create category: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to create category: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const handleSave = async () => {
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      await updateCategory(editingCategory).unwrap();
      toast.success("Category updated successfully!");
      setAlert({ type: "success", message: "Category updated successfully!" });
      setEditingCategory(null);
      refetch();
    } catch (err: unknown) {
      console.error("Failed to update category:", err);
      toast.error(
        `Failed to update category: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to update category: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted successfully!");
        setAlert({
          type: "success",
          message: "Category deleted successfully!",
        });
        refetch();
      } catch (err: unknown) {
        console.error("Failed to delete category:", err);
        toast.error(
          `Failed to delete category: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`
        );
        setAlert({
          type: "error",
          message: `Failed to delete category: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Categories
      </h1>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Create New Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category Name"
            id="newCategoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Blood Tests"
            required
          />
          <Input
            label="Description (Optional)"
            id="newCategoryDescription"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            placeholder="e.g., Tests related to blood analysis"
          />
        </div>
        <Button variant="primary" onClick={handleCreate} className="mt-4">
          Add Category
        </Button>
      </div>

      {categories?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No categories found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {category.description || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Category
            </h2>
            <Input
              label="Category Name"
              id="name"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
            />
            <Input
              label="Description"
              id="description"
              value={editingCategory.description || ""}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  description: e.target.value,
                })
              }
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CategoryList, {allowedRoles: ["admin"]});
