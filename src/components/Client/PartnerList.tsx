"use client";

import React from "react";
import Button from "@/components/ui/Button";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { useGetApprovedPartnerProfilesQuery } from "@/redux/features/partnerProfiles/partnerProfilesApi";
import toast from "react-hot-toast";
import Link from "next/link";

const PartnerList: React.FC = () => {
  const {
    data: partners,
    isLoading,
    isError,
    error,
  } = useGetApprovedPartnerProfilesQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FullPageLoader isLoading={isLoading} message="Loading partners..." />
      </div>
    );
  }

  if (isError) {
    let errorMessage = "Unknown error";
    type CustomError = { message?: string; status?: number; data?: unknown };
    const customError = error as CustomError;
    if (error && typeof error === "object") {
      if ("message" in error && typeof customError.message === "string") {
        errorMessage = customError.message;
      } else if ("status" in error && "data" in error) {
        errorMessage = `Status: ${customError.status}`;
      }
    }
    toast.error(`Error fetching partners: ${errorMessage}`);
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">
        Our Trusted Partners
      </h1>
      {partners?.length === 0 ? (
        <p className="text-primary text-center py-8 text-lg">
          No approved partners found at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners?.map((partner) => (
            <div
              key={partner.id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {partner.company_name}
              </h2>
              <p className="text-gray-600 mb-4">{partner.company_slug}</p>
              <p className="text-sm text-gray-500 mb-4">
                Contact: {partner.contact_email}
              </p>
              <Link
                href={`/partners/${partner.id}/products`}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/partners/${partner.id}/products`;
                }}
              >
                <Button variant="primary" size="md" type="button">
                  View Products
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerList;
