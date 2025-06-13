// components/admin/PartnerApprovalList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api-client";
import { PartnerProfile } from "@/types/db";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const PartnerApprovalList: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<{
    id: string;
    action: "approved" | "rejected";
  } | null>(null);

  const {
    data: partners,
    isLoading,
    isError,
    error,
  } = useQuery<PartnerProfile[], Error>({
    queryKey: ["partnerProfiles"],
    queryFn: () => api.get("/partner_profiles"),
  });

  const updatePartnerStatusMutation = useMutation<
    PartnerProfile,
    Error,
    { id: string; partner_status: "approved" | "rejected" }
  >({
    mutationFn: ({ id, partner_status }) =>
      api.patch(`/partner_profiles/${id}`, { partner_status }),
    onSuccess: (_, variables) => {
      toast.success(`Partner ${variables.partner_status} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["partnerProfiles"] });
    },
    onError: (err) => {
      toast.error(`Failed to update partner status: ${err.message}`);
    },
  });

  const openConfirm = (id: string, action: "approved" | "rejected") => {
    setSelected({ id, action });
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (selected) {
      updatePartnerStatusMutation.mutate({
        id: selected.id,
        partner_status: selected.action,
      });
    }
    setModalOpen(false);
    setSelected(null);
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
        Error: {error?.message || "Failed to load partners"}
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
                      isLoading={updatePartnerStatusMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openConfirm(partner.id, "rejected")}
                      isLoading={updatePartnerStatusMutation.isPending}
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
                    onClick={() => console.log("View details for", partner.id)}
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
    </div>
  );
};

export default withAuth(PartnerApprovalList, { allowedRoles: ["admin"] });
