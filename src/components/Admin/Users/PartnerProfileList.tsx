"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  useGetPartnerProfilesQuery,
  useUpdatePartnerProfileMutation,
  useDeletePartnerProfileMutation,
} from "@/redux/features/partnerProfiles/partnerProfilesApi";
import { PartnerProfile } from "@/redux/features/partnerProfiles/partnerProfilesTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const PartnerProfileList: React.FC = () => {
  const {
    data: profiles,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPartnerProfilesQuery();
  const [updateProfile] = useUpdatePartnerProfileMutation();
  const [deleteProfile] = useDeletePartnerProfileMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editingProfile, setEditingProfile] = useState<PartnerProfile | null>(
    null
  );

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
      toast.error(`Failed to load partner profiles: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load partner profiles: ${getErrorMessage(error)}`,
      });
    }
  }, [isError, error]);

  const handleEdit = (profile: PartnerProfile) => {
    setEditingProfile({ ...profile });
  };

  const handleSave = async () => {
    if (!editingProfile) return;

    try {
      await updateProfile(editingProfile).unwrap();
      toast.success("Partner profile updated successfully!");
      setAlert({
        type: "success",
        message: "Partner profile updated successfully!",
      });
      setEditingProfile(null);
      refetch();
    } catch (err: unknown) {
      console.error("Failed to update partner profile:", err);
      toast.error(
        `Failed to update profile: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to update profile: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this partner profile?")
    ) {
      try {
        await deleteProfile(id).unwrap();
        toast.success("Partner profile deleted successfully!");
        setAlert({
          type: "success",
          message: "Partner profile deleted successfully!",
        });
        refetch();
      } catch (err: unknown) {
        console.error("Failed to delete partner profile:", err);
        toast.error(
          `Failed to delete profile: ${getErrorMessage(
            err as FetchBaseQueryError | SerializedError
          )}`
        );
        setAlert({
          type: "error",
          message: `Failed to delete profile: ${getErrorMessage(
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
        <p className="ml-2">Loading partner profiles...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Partner Profiles
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

      {profiles?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No partner profiles found.
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
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {profiles?.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {profile.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {profile.contact_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        profile.partner_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : profile.partner_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.partner_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(profile)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(profile.id)}
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

      {editingProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Partner Profile
            </h2>
            <Input
              label="Company Name"
              id="company_name"
              value={editingProfile.company_name}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  company_name: e.target.value,
                })
              }
            />
            <Input
              label="Contact Email"
              id="contact_email"
              value={editingProfile.contact_email}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  contact_email: e.target.value,
                })
              }
            />
            <div className="mb-4">
              <label
                htmlFor="partner_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="partner_status"
                name="partner_status"
                value={editingProfile.partner_status}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    partner_status: e.target.value as
                      | "pending"
                      | "approved"
                      | "rejected"
                      | "suspended"
                      | "deactivated",
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <Input
              label="Rejection Reason (if applicable)"
              id="rejection_reason"
              value={editingProfile.rejection_reason || ""}
              onChange={(e) =>
                setEditingProfile({
                  ...editingProfile,
                  rejection_reason: e.target.value,
                })
              }
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingProfile(null)}
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

export default withAuth(PartnerProfileList, {allowedRoles: ["admin"]});
