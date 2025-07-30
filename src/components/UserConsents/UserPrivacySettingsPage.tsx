import React from "react";
import { useGetUserConsentsQuery } from "@/redux/features/userConsents/userConsentsApi";
import { UserConsent } from "@/redux/features/userConsents/userConsentsTypes";

const MOCK_USER_ID = "some-authenticated-user-id";

const UserPrivacySettingsPage: React.FC = () => {
  const {
    data: consents,
    isLoading,
    error,
  } = useGetUserConsentsQuery({
    userId: MOCK_USER_ID,
    latest_only: false, // Get all consents for history
  });

  if (isLoading) {
    return <div>Loading privacy settings...</div>;
  }

  if (error) {
    return <div>Error loading privacy settings: {error.toString()}</div>;
  }

  const userConsents: UserConsent[] = Array.isArray(consents)
    ? consents
    : consents
    ? [consents]
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Privacy Settings</h1>

      <p className="mb-4">
        Here you can review the consent decisions you&apos;ve made.
      </p>

      {userConsents.length === 0 ? (
        <p className="text-gray-500">
          No consent records found for your account.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Consent Type
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Agreed
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Version
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Timestamp
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  IP Address
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {userConsents.map((consent) => (
                <tr key={consent.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-sm">{consent.consent_type}</td>
                  <td className="px-4 py-2 text-sm">
                    {consent.agreed ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {consent.consent_version}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(consent.consent_timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {consent.ip_address || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {consent.notes || "N/A"}
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
