"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  useGetUploadsQuery,
  useDeleteUploadMutation,
} from "@/redux/features/uploads/uploadsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const UploadList: React.FC = () => {
  const {
    data: uploads,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUploadsQuery();
  const [deleteUpload] = useDeleteUploadMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      toast.error(`Failed to load uploads: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load uploads: ${getErrorMessage(error)}`,
      });
    }
  }, [isError, error]);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this upload? This will also remove associated patient marker values."
      )
    ) {
      try {
        await deleteUpload(id).unwrap();
        toast.success("Upload deleted successfully!");
        setAlert({ type: "success", message: "Upload deleted successfully!" });
        refetch();
      } catch (err: unknown) {
        console.error("Failed to delete upload:", err);
        toast.error(
          `Failed to delete upload: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`
        );
        setAlert({
          type: "error",
          message: `Failed to delete upload: ${getErrorMessage(
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
        <p className="ml-2">Loading uploads...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Uploads
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

      {uploads?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No uploads found.
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
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploads?.map((upload) => (
                <tr key={upload.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {upload.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {upload.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {upload.admin_user_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {upload.client_user_id?.substring(0, 8) || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(upload.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(upload.id)}
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
    </div>
  );
};

export default withAuth(UploadList, {allowedRoles: ["admin"]});
