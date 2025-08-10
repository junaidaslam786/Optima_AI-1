"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetPartnerProductByIdQuery } from "@/redux/features/partnerProducts/partnerProductsApi";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import SingleProductView from "@/components/Products/SingleProductView";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

const ProductPage = () => {
  const params = useParams();
  const productId = params.id as string;

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetPartnerProductByIdQuery(productId);

  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";

    if ("status" in error) {
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        "error" in error.data &&
        typeof error.data.error === "string"
      ) {
        return error.data.error;
      }
      return `API Error: ${error.status}`;
    } else if ("message" in error) {
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
        <p className="ml-2">Loading product...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Alert type="error" message={`Error: ${getErrorMessage(error)}`} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Alert type="error" message="Product not found" />
      </div>
    );
  }

  return <SingleProductView product={product} />;
};

export default ProductPage;
