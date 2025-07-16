"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  useGetMarkersQuery,
  useCreateMarkerMutation,
  useUpdateMarkerMutation,
  useDeleteMarkerMutation,
} from "@/redux/features/markers/markersApi";
import { Marker, CreateMarker } from "@/redux/features/markers/markersTypes";
import { useGetPanelsQuery } from "@/redux/features/panels/panelsApi"; // To select panel_id
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const MarkerList: React.FC = () => {
  const {
    data: markers,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMarkersQuery();
  const {
    data: panels,
    isLoading: isLoadingPanels,
    isError: isPanelsError,
    error: panelsError,
  } = useGetPanelsQuery();
  const [createMarker] = useCreateMarkerMutation();
  const [updateMarker] = useUpdateMarkerMutation();
  const [deleteMarker] = useDeleteMarkerMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [newMarkerData, setNewMarkerData] = useState<CreateMarker>({
    panel_id: "",
    marker: "",
    unit: "",
    normal_low: undefined,
    normal_high: undefined,
  });
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);

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
      toast.error(`Failed to load markers: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load markers: ${getErrorMessage(error)}`,
      });
    }
    if (isPanelsError) {
      toast.error(`Failed to load panels: ${getErrorMessage(panelsError)}`);
      setAlert({
        type: "error",
        message: `Failed to load panels for marker creation: ${getErrorMessage(
          panelsError
        )}`,
      });
    }
  }, [isError, error, isPanelsError, panelsError]);

  const handleCreate = async () => {
    if (
      !newMarkerData.panel_id ||
      !newMarkerData.marker.trim() ||
      !newMarkerData.unit.trim()
    ) {
      toast.error("Panel, Marker, and Unit are required.");
      return;
    }
    try {
      await createMarker(newMarkerData).unwrap();
      toast.success("Marker created successfully!");
      setAlert({ type: "success", message: "Marker created successfully!" });
      setNewMarkerData({
        panel_id: "",
        marker: "",
        unit: "",
        normal_low: undefined,
        normal_high: undefined,
      });
      refetch();
    } catch (err: unknown) {
      console.error("Failed to create marker:", err);
      toast.error(
        `Failed to create marker: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to create marker: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleEdit = (marker: Marker) => {
    setEditingMarker({ ...marker });
  };

  const handleSave = async () => {
    if (!editingMarker) return;
    if (
      !editingMarker.panel_id ||
      !editingMarker.marker.trim() ||
      !editingMarker.unit.trim()
    ) {
      toast.error("Panel, Marker, and Unit are required.");
      return;
    }
    try {
      await updateMarker(editingMarker).unwrap();
      toast.success("Marker updated successfully!");
      setAlert({ type: "success", message: "Marker updated successfully!" });
      setEditingMarker(null);
      refetch();
    } catch (err: unknown) {
      console.error("Failed to update marker:", err);
      toast.error(
        `Failed to update marker: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to update marker: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this marker?")) {
      try {
        await deleteMarker(id).unwrap();
        toast.success("Marker deleted successfully!");
        setAlert({ type: "success", message: "Marker deleted successfully!" });
        refetch();
      } catch (err: unknown) {
        console.error("Failed to delete marker:", err);
        toast.error(
          `Failed to delete marker: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`
        );
        setAlert({
          type: "error",
          message: `Failed to delete marker: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`,
        });
      }
    }
  };

  if (isLoading || isLoadingPanels) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading markers and panels...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Markers
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
          Create New Marker
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="newPanelId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Panel
            </label>
            <select
              id="newPanelId"
              name="panel_id"
              value={newMarkerData.panel_id}
              onChange={(e) =>
                setNewMarkerData({ ...newMarkerData, panel_id: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            >
              <option value="">Select a Panel</option>
              {panels?.map((panel) => (
                <option key={panel.id} value={panel.id}>
                  {panel.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Marker Name"
            id="marker"
            value={newMarkerData.marker}
            onChange={(e) =>
              setNewMarkerData({ ...newMarkerData, marker: e.target.value })
            }
            placeholder="e.g., Glucose"
            required
          />
          <Input
            label="Unit"
            id="unit"
            value={newMarkerData.unit}
            onChange={(e) =>
              setNewMarkerData({ ...newMarkerData, unit: e.target.value })
            }
            placeholder="e.g., mg/dL"
            required
          />
          <Input
            label="Normal Low Value (Optional)"
            id="normal_low"
            type="number"
            value={newMarkerData.normal_low ?? ""}
            onChange={(e) =>
              setNewMarkerData({
                ...newMarkerData,
                normal_low: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            placeholder="e.g., 70"
          />
          <Input
            label="Normal High Value (Optional)"
            id="normal_high"
            type="number"
            value={newMarkerData.normal_high ?? ""}
            onChange={(e) =>
              setNewMarkerData({
                ...newMarkerData,
                normal_high: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            placeholder="e.g., 99"
          />
        </div>
        <Button variant="primary" onClick={handleCreate} className="mt-4">
          Add Marker
        </Button>
      </div>

      {markers?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No markers found.
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
                  Panel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Range
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {markers?.map((marker) => (
                <tr key={marker.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {marker.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {panels?.find((p) => p.id === marker.panel_id)?.name ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {marker.marker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {marker.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {marker.normal_low !== undefined &&
                    marker.normal_high !== undefined
                      ? `${marker.normal_low} - ${marker.normal_high}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(marker)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(marker.id)}
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

      {editingMarker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Marker
            </h2>
            <div className="mb-4">
              <label
                htmlFor="editPanelId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Panel
              </label>
              <select
                id="editPanelId"
                name="panel_id"
                value={editingMarker.panel_id}
                onChange={(e) =>
                  setEditingMarker({
                    ...editingMarker,
                    panel_id: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="">Select a Panel</option>
                {panels?.map((panel) => (
                  <option key={panel.id} value={panel.id}>
                    {panel.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Marker Name"
              id="marker"
              value={editingMarker.marker}
              onChange={(e) =>
                setEditingMarker({ ...editingMarker, marker: e.target.value })
              }
            />
            <Input
              label="Unit"
              id="unit"
              value={editingMarker.unit}
              onChange={(e) =>
                setEditingMarker({ ...editingMarker, unit: e.target.value })
              }
            />
            <Input
              label="Normal Low Value (Optional)"
              id="normal_low"
              type="number"
              value={editingMarker.normal_low ?? ""}
              onChange={(e) =>
                setEditingMarker({
                  ...editingMarker,
                  normal_low: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
            <Input
              label="Normal High Value (Optional)"
              id="normal_high"
              type="number"
              value={editingMarker.normal_high ?? ""}
              onChange={(e) =>
                setEditingMarker({
                  ...editingMarker,
                  normal_high: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingMarker(null)}
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

export default withAuth(MarkerList, {allowedRoles: ["admin"]});
