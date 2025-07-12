"use client";

import React, { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import Alert from "@/components/ui/Alert"; // Corrected import path
import { useGetPartnerProductsQuery } from "@/redux/features/partnerProducts/partnerProductsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Import FetchBaseQueryError
import { SerializedError } from "@reduxjs/toolkit"; // Import SerializedError
import ProductCard from "@/components/Products/ProductCard";

interface ProductListProps {
  partnerId?: string; // Optional filter by partnerId
}

const ProductList: React.FC<ProductListProps> = ({ partnerId }) => {
  const {
    data: partnerProducts,
    isLoading,
    isError,
    error,
  } = useGetPartnerProductsQuery();

  const filteredProducts = React.useMemo(() => {
    if (!partnerProducts) return [];
    if (partnerId) {
      return partnerProducts.filter(
        (product) => product.partner_id === partnerId
      );
    }
    return partnerProducts;
  }, [partnerProducts, partnerId]);

  // Helper function to get the error message safely
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
      // This is a SerializedError
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load products: ${getErrorMessage(error)}`);
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center text-red-600 mt-10">
        <Alert type="error" message={`Error: ${getErrorMessage(error)}`} />
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto p-6 bg-primary/30 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        {partnerId
          ? `Products from ${
              filteredProducts?.[0]?.partner_id || "Partner" // Display partner ID or name if available
            }`
          : "All Partner Products"}
      </h1>
      {filteredProducts?.length === 0 ? (
        <p className="w-full text-primary text-center py-8 text-lg">
          No products found from this partner.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
