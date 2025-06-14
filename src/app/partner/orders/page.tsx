// app/partner/orders/page.tsx
"use client";

import OrderList from "@/components/Orders/OrderList";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { PartnerProfile } from "@/types/db";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function PartnerOrdersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const sessionLoading = status === "loading";

  const {
    data: partnerProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery<PartnerProfile[], Error, PartnerProfile>({
    queryKey: ["myPartnerProfile", user?.id],
    queryFn: () => api.get(`/partner_profiles?user_id=${user?.id}`),
    enabled: !!user?.id && !sessionLoading,
    select: (data) => data?.[0] || null, // Assume one partner profile per user
  });

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading partner data...</p>
      </div>
    );
  }

  if (profileError || !partnerProfile || partnerProfile.partner_status !== "approved") {
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
    <div className="min-h-screen bg-gray-100 py-12">
      <OrderList mode="partner" filterByPartnerId={partnerProfile.id} />
    </div>
  );
}

