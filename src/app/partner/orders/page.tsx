"use client";

import OrderList from "@/components/Orders/OrderList";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { PartnerProfile } from "@/redux/features/partnerProfiles/partnerProfilesTypes";
import { useGetPartnerProfileByUserIdQuery } from "@/redux/features/partnerProfiles/partnerProfilesApi";

export default function PartnerOrdersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const sessionLoading = status === "loading";

  const {
    data: partnerProfiles,
    isLoading: profileLoading,
    isError: profileError,
    error: profileFetchError,
  } = useGetPartnerProfileByUserIdQuery(user?.id || "", {
    skip: !user?.id || sessionLoading,
  });

  const partnerProfile: PartnerProfile | null =
    partnerProfiles && partnerProfiles.length > 0 ? partnerProfiles[0] : null;

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading partner data...</p>
      </div>
    );
  }

  if (
    profileError ||
    !partnerProfile ||
    partnerProfile.partner_status !== "approved"
  ) {
    if (profileError) {
      console.error("Error fetching partner profile:", profileFetchError);
    }

    return (
      <div className="text-center mt-10 p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg mx-auto max-w-md">
        <p className="font-semibold">
          Access Denied: You are not an approved partner.
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 py-12">
      <OrderList mode="partner" />
    </div>
  );
}
