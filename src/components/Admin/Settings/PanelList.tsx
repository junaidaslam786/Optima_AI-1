"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  useGetPanelsQuery,
  useCreatePanelMutation,
  useUpdatePanelMutation,
  useDeletePanelMutation,
} from "@/redux/features/panels/panelsApi";
import { Panel, CreatePanel } from "@/redux/features/panels/panelsTypes";
import { useGetCategoriesQuery } from "@/redux/features/categories/categoriesApi"; // To select category_id
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const PanelList: React.FC = () => {
  const {
    data: panels,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPanelsQuery();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategoriesQuery();
  const [createPanel] = useCreatePanelMutation();
  const [updatePanel] = useUpdatePanelMutation();
  const [deletePanel] = useDeletePanelMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [newPanelData, setNewPanelData] = useState<CreatePanel>({
    name: "",
    description: undefined,
    category_id: undefined,
  });
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);

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
      toast.error(`Failed to load panels: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load panels: ${getErrorMessage(error)}`,
      });
    }
    if (isCategoriesError) {
      toast.error(
        `Failed to load categories: ${getErrorMessage(categoriesError)}`
      );
      setAlert({
        type: "error",
        message: `Failed to load categories for panel creation: ${getErrorMessage(
          categoriesError
        )}`,
      });
    }
  }, [isError, error, isCategoriesError, categoriesError]);

  const handleCreate = async () => {
    if (!newPanelData.name.trim()) {
      toast.error("Panel name is required.");
      return;
    }
    try {
      await createPanel(newPanelData).unwrap();
      toast.success("Panel created successfully!");
      setAlert({ type: "success", message: "Panel created successfully!" });
      setNewPanelData({
        name: "",
        description: undefined,
        category_id: undefined,
      });
      refetch();
    } catch (err: unknown) {
      console.error("Failed to create panel:", err);
      toast.error(
        `Failed to create panel: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to create panel: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleEdit = (panel: Panel) => {
    setEditingPanel({ ...panel });
  };

  const handleSave = async () => {
    if (!editingPanel) return;
    if (!editingPanel.name.trim()) {
      toast.error("Panel name is required.");
      return;
    }
    try {
      await updatePanel(editingPanel).unwrap();
      toast.success("Panel updated successfully!");
      setAlert({ type: "success", message: "Panel updated successfully!" });
      setEditingPanel(null);
      refetch();
    } catch (err: unknown) {
      console.error("Failed to update panel:", err);
      toast.error(
        `Failed to update panel: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to update panel: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this panel?")) {
      try {
        await deletePanel(id).unwrap();
        toast.success("Panel deleted successfully!");
        setAlert({ type: "success", message: "Panel deleted successfully!" });
        refetch();
      } catch (err: unknown) {
        console.error("Failed to delete panel:", err);
        toast.error(
          `Failed to delete panel: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`
        );
        setAlert({
          type: "error",
          message: `Failed to delete panel: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`,
        });
      }
    }
  };

  if (isLoading || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading panels and categories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Panels
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
          Create New Panel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Panel Name"
            id="name"
            value={newPanelData.name}
            onChange={(e) =>
              setNewPanelData({ ...newPanelData, name: e.target.value })
            }
            placeholder="e.g., General Health Panel"
            required
          />
          <Input
            label="Description (Optional)"
            id="description"
            value={newPanelData.description || ""}
            onChange={(e) =>
              setNewPanelData({ ...newPanelData, description: e.target.value })
            }
            placeholder="e.g., A comprehensive panel for overall health"
          />
          <div className="mb-4">
            <label
              htmlFor="newCategoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category (Optional)
            </label>
            <select
              id="newCategoryId"
              name="category_id"
              value={newPanelData.category_id || ""}
              onChange={(e) =>
                setNewPanelData({
                  ...newPanelData,
                  category_id: e.target.value || undefined,
                })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Select a Category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="primary" onClick={handleCreate} className="mt-4">
          Add Panel
        </Button>
      </div>

      {panels?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No panels found.
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
                  Category
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
              {panels?.map((panel) => (
                <tr key={panel.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {panel.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {panel.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {panel.description || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {categories?.find((c) => c.id === panel.category_id)
                      ?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(panel.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(panel)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(panel.id)}
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

      {editingPanel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Panel
            </h2>
            <Input
              label="Panel Name"
              id="name"
              value={editingPanel.name}
              onChange={(e) =>
                setEditingPanel({ ...editingPanel, name: e.target.value })
              }
            />
            <Input
              label="Description"
              id="description"
              value={editingPanel.description || ""}
              onChange={(e) =>
                setEditingPanel({
                  ...editingPanel,
                  description: e.target.value,
                })
              }
            />
            <div className="mb-4">
              <label
                htmlFor="editCategoryId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category (Optional)
              </label>
              <select
                id="editCategoryId"
                name="category_id"
                value={editingPanel.category_id || ""}
                onChange={(e) =>
                  setEditingPanel({
                    ...editingPanel,
                    category_id: e.target.value || undefined,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="">Select a Category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={() => setEditingPanel(null)}>
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

export default withAuth(PanelList, { allowedRoles: ["admin"] });
