"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useGetUserConsentsQuery } from "@/redux/features/userConsents/userConsentsApi";
import { UserConsent } from "@/redux/features/userConsents/userConsentsTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Shield,
  CheckCircle,
  XCircle,
  Info,
  CalendarDays,
  Globe,
} from "lucide-react";
import Link from "next/link";

const UserPrivacySettingsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id || null;

  const {
    data: consents,
    isLoading,
    error,
    isFetching,
  } = useGetUserConsentsQuery(
    { userId: userId || "", latest_only: false },
    { skip: !userId }
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
        <p className="ml-2">Loading privacy settings...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !userId) {
    return (
      <div className="container mx-auto p-8 text-center bg-white shadow-md rounded-lg mt-8">
        <h1 className="text-3xl font-bold mb-4 text-primary">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          Please log in to view your privacy settings.
        </p>
        <Link
          href="/auth/signin"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center bg-red-100 border border-red-400 text-red-700 shadow-md rounded-lg mt-8">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>
          Error loading your privacy settings:{" "}
          {error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "An unknown error occurred."}
        </p>
        <p className="text-sm mt-2">Please try again later.</p>
      </div>
    );
  }

  const userConsents: UserConsent[] = Array.isArray(consents)
    ? consents
    : consents
    ? [consents]
    : [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <Shield size={36} /> Your Privacy Settings
      </h1>

      <p className="text-lg text-gray-700 mb-8 max-w-2xl">
        Here you can review a detailed history of your consent decisions for
        various data processing activities on our website.
      </p>

      {isFetching && (
        <div className="flex items-center text-blue-600 mb-4">
          <LoadingSpinner />
          <span className="ml-2">Refreshing consent history...</span>
        </div>
      )}

      {userConsents.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-lg shadow-inner flex items-start gap-4">
          <Info size={24} className="mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-2">
              No Consent Records Found
            </h2>
            <p className="text-blue-700">
              It looks like we don&apos;t have any consent records associated
              with your logged-in account. This might be because you
              haven&apos;t interacted with a consent banner yet, or your consent
              was recorded anonymously.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <CalendarDays size={14} className="inline-block mr-1" />{" "}
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Globe size={14} className="inline-block mr-1" /> IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userConsents.map((consent) => (
                <tr key={consent.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consent.consent_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {consent.agreed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} className="mr-1" /> Agreed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={14} className="mr-1" /> Declined
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consent.consent_version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(consent.consent_timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consent.ip_address || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <p
                      className="max-w-[200px] truncate"
                      title={consent.user_agent || "N/A"}
                    >
                      {consent.user_agent || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <p
                      className="max-w-[250px] truncate"
                      title={consent.notes || "N/A"}
                    >
                      {consent.notes || "No notes"}
                    </p>
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

export default UserPrivacySettingsPage;
