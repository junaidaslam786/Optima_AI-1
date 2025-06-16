// components/admin/PartnerDetailsModal.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { PartnerProfile, User } from "@/types/db";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string | null;
}

const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onClose,
  partnerId,
}) => {
  const {
    data: partnerProfile,
    isLoading: isPartnerLoading,
    isError: isPartnerError,
    error: partnerError,
  } = useQuery<PartnerProfile, Error>({
    queryKey: ["partnerProfile", partnerId],
    queryFn: () => {
      if (!partnerId) {
        throw new Error("Partner ID is required to fetch profile.");
      }
      return api.get(`/partner_profiles/${partnerId}`);
    },
    enabled: !!partnerId && isOpen,
  });

  const {
    data: userDetails,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery<User, Error>({
    queryKey: ["userDetails", partnerProfile?.user_id],
    queryFn: () => {
      if (!partnerProfile?.user_id) {
        throw new Error("User ID is required to fetch user details.");
      }
      return api.get(`/users/${partnerProfile.user_id}`);
    },
    enabled: !!partnerProfile?.user_id && isOpen, // Only run query if user_id is present and modal is open
  });

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  const renderDetailRow = (label: string, value: string | undefined | null) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-900 break-words text-right ml-4">
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="w-full fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-5/6 bg-white rounded-lg shadow-2xl p-6 mx-auto my-12 max-h-[80vh] overflow-auto transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-3xl font-bold text-primary">Partner Details</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {(isPartnerLoading || isUserLoading) && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
            <p className="ml-2 text-primary">Loading partner details...</p>
          </div>
        )}

        {(isPartnerError || isUserError) && (
          <div className="text-center p-4 text-danger">
            <p>
              Error loading details:{" "}
              {partnerError?.message || userError?.message || "Unknown error"}
            </p>
          </div>
        )}

        {/* Divide details into two columns for screens larger than lg */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {partnerProfile && (
            <div className="mb-6 lg:mb-0"> {/* Added lg:mb-0 to remove bottom margin on larger screens */}
              <h3 className="text-xl font-semibold text-secondary-dark mb-3">
                Partner Profile Information
              </h3>
              {renderDetailRow("Company Name", partnerProfile.company_name)}
              {renderDetailRow("Company Slug", partnerProfile.company_slug)}
              {renderDetailRow("Description", partnerProfile.company_description)}
              {renderDetailRow("Contact Person", partnerProfile.contact_person_name)}
              {renderDetailRow("Contact Email", partnerProfile.contact_email)}
              {renderDetailRow("Contact Phone", partnerProfile.contact_phone)}
              {renderDetailRow("Address", partnerProfile.address)}
              {renderDetailRow("Country", partnerProfile.country)}
              {renderDetailRow("Status", partnerProfile.partner_status)}
              {renderDetailRow(
                "Approval Date",
                partnerProfile.approval_date
                  ? new Date(partnerProfile.approval_date).toDateString()
                  : "N/A"
              )}
              {renderDetailRow("Rejection Reason", partnerProfile.rejection_reason)}
              {renderDetailRow("Notes", partnerProfile.notes)}
              {renderDetailRow(
                "Created At",
                new Date(partnerProfile.created_at).toDateString()
              )}
              {renderDetailRow(
                "Last Updated",
                new Date(partnerProfile.updated_at).toDateString()
              )}
            </div>
          )}

          {userDetails && (
            <div>
              <h3 className="text-xl font-semibold text-secondary-dark mb-3">
                User Account Information
              </h3>
              {renderDetailRow("User ID", userDetails.id)}
              {renderDetailRow("Email", userDetails.email)}
              {renderDetailRow("Name", userDetails.name)}
              {renderDetailRow("Role", userDetails.role)}
              {renderDetailRow("Date of Birth", userDetails.dob)}
              {renderDetailRow("Address", userDetails.address)}
              {renderDetailRow("Subscription", userDetails.subscription)}
              {renderDetailRow("Phone", userDetails.phone)}
              {renderDetailRow(
                "User Created At",
                new Date(userDetails.created_at).toDateString()
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailsModal;