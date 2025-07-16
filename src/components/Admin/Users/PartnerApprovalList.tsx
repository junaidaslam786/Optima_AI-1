"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PartnerDetailsModal from "@/components/Admin/Users/PartnerDetailsModal";
import {
  useGetPartnerProfilesQuery,
  useUpdatePartnerProfileMutation,
} from "@/redux/features/partnerProfiles/partnerProfilesApi";

const PartnerApprovalList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartnerIdForDetails, setSelectedPartnerIdForDetails] =
    useState<string | null>(null);
  const [selected, setSelected] = useState<{
    id: string;
    action: "approved" | "rejected";
  } | null>(null);
  const currentDate = new Date().toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const {
    data: partners,
    isLoading,
    isError,
    error,
  } = useGetPartnerProfilesQuery();

  const [
    updatePartnerProfileMutation,
    {
      isLoading: isUpdatingStatus,
      isSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdatePartnerProfileMutation();

  React.useEffect(() => {
    if (isSuccess) {
      toast.success(`Partner ${selected?.action} successfully!`);
      setSelected(null);
    }
    if (updateError) {
      let errorMessage = "Unknown error";
      if (updateErrorDetails) {
        if (
          "message" in updateErrorDetails &&
          typeof updateErrorDetails.message === "string"
        ) {
          errorMessage = updateErrorDetails.message;
        } else if (
          "data" in updateErrorDetails &&
          typeof updateErrorDetails.data === "string"
        ) {
          errorMessage = updateErrorDetails.data;
        }
      }
      toast.error(`Failed to update partner status: ${errorMessage}`);
    }
  }, [isSuccess, updateError, updateErrorDetails, selected]);

  const openConfirm = (id: string, action: "approved" | "rejected") => {
    setSelected({ id, action });
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (selected) {
      try {
        await updatePartnerProfileMutation({
          id: selected.id,
          partner_status: selected.action,
          approval_date: currentDate,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update partner status:", err);
      }
    }
    setModalOpen(false);
  };

  const openDetailsModal = (partnerId: string) => {
    setSelectedPartnerIdForDetails(partnerId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPartnerIdForDetails(null);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 bg-secondary/30 border border-secondary text-secondary rounded-lg mx-auto">
        <LoadingSpinner />
        <p className="ml-2 text-secondary">Loading partner requests...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center p-8 bg-secondary border border-secondary text-secondary rounded-lg mx-auto">
        Error:{" "}
        {error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : error &&
            typeof error === "object" &&
            "data" in error &&
            typeof error.data === "string"
          ? error.data
          : "Failed to load partners"}
      </div>
    );
  }

  const pendingPartners =
    partners?.filter((p) => p.partner_status === "pending") || [];
  const approvedPartners =
    partners?.filter((p) => p.partner_status === "approved") || [];

  return (
    <div className="w-full container mx-auto p-8 bg-secondary/30">
      <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">
        Partner Approval Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Partners Section */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary/90 mb-6 border-b pb-3">
            Pending Approvals ({pendingPartners.length})
          </h2>
          {pendingPartners.length === 0 ? (
            <p className="text-secondary text-center py-4">
              No pending partner registrations.
            </p>
          ) : (
            <ul className="divide-y divide-secondary">
              {pendingPartners.map((partner) => (
                <li
                  key={partner.id}
                  className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="text-primary text-lg font-semibold">
                      {partner.company_name}
                    </p>
                    <p className="text-secondary text-sm">
                      Slug: {partner.company_slug}
                    </p>
                    <p className="text-secondary text-sm">
                      Contact: {partner.contact_email}
                    </p>
                    <p className="text-tertiary text-xs">
                      Registered:{" "}
                      {new Date(partner.created_at ?? "").toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openConfirm(partner.id, "approved")}
                      isLoading={isUpdatingStatus}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openConfirm(partner.id, "rejected")}
                      isLoading={isUpdatingStatus}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Approved Partners Section */}
        <div className="w-full bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-3">
            Approved Partners ({approvedPartners.length})
          </h2>
          {approvedPartners.length === 0 ? (
            <p className="text-secondary text-center py-4">
              No approved partners yet.
            </p>
          ) : (
            <ul className="divide-y divide-secondary">
              {approvedPartners.map((partner) => (
                <li
                  key={partner.id}
                  className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="text-primary text-lg font-semibold">
                      {partner.company_name}
                    </p>
                    <p className="text-secondary text-sm">
                      Contact: {partner.contact_email}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDetailsModal(partner.id)}
                  >
                    View Details
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        title={
          selected?.action === "approved"
            ? "Confirm Approval"
            : "Confirm Rejection"
        }
        description={`Are you sure you want to ${
          selected?.action === "approved" ? "approve" : "reject"
        } this partner?`}
        confirmLabel={
          selected?.action === "approved" ? "Yes, Approve" : "Yes, Reject"
        }
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <PartnerDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        partnerId={selectedPartnerIdForDetails}
      />
    </div>
  );
};

export default withAuth(PartnerApprovalList, { allowedRoles: ["admin"] });
