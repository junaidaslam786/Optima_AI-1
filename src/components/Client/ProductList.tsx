// components/Client/ProductList.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import { api } from "@/lib/api-client";
import { PartnerProductWithDetails, PartnerProductImage } from "@/types/db";
import Image from "next/image";

interface ProductListProps {
  partnerId?: string;
}

const ProductList: React.FC<ProductListProps> = ({ partnerId }) => {
  const {
    data: partnerProducts,
    isLoading,
    isError,
    error,
  } = useQuery<PartnerProductWithDetails[], Error>({
    queryKey: ["partnerProducts", partnerId],
    queryFn: () => {
      const queryString = partnerId ? `?partner_id=${partnerId}` : "";
      return api.get(`/partner_products${queryString}`);
    },
  });

  const productIds = partnerProducts?.map((p) => p.id) || [];
  const {
    data: allProductImages,
    isLoading: imagesLoading,
    isError: imagesError,
  } = useQuery<PartnerProductImage[], Error>({
    queryKey: ["allPartnerProductImages", productIds],
    queryFn: async (): Promise<PartnerProductImage[]> => {
      if (productIds.length === 0) return []; // Avoid fetching if no products
      // You might have a single API endpoint like `/api/partner_product_images?product_ids=id1,id2,...`
      // For now, making individual calls (less efficient but works)
      const results = await Promise.all(
        productIds.map((id) =>
          api.get(`/partner_product_images?partner_product_id=${id}`)
        )
      );
      return results.flat() as PartnerProductImage[];
    },
    enabled: productIds.length > 0,
    select: (data) => data.filter((img) => img.is_thumbnail),
  });

  const getThumbnail = (productId: string) => {
    return (
      allProductImages?.find((img) => img.partner_product_id === productId)
        ?.image_url || "/placeholder-image.jpg"
    );
  };

  if (isLoading || imagesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading products...</p>
      </div>
    );
  }

  if (isError || imagesError) {
    return (
      <div className="text-center text-red-600 mt-10">
        <Alert
          type="error"
          message={`Error: ${error?.message || "Failed to load products"}`}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        {partnerId
          ? `Products from ${
              partnerProducts?.[0]?.partner_profiles?.company_name || "Partner"
            }`
          : "All Partner Products"}
      </h1>
      {partnerProducts?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No products found from this partner.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {partnerProducts?.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative w-full h-48">
                <Image
                  src={getThumbnail(product.id)}
                  alt={product.admin_products?.name || "Product Image"}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {product.admin_products?.name || "Unnamed Product"}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  By:{" "}
                  {product.partner_profiles?.company_name || "Unknown Partner"}
                </p>
                <p className="text-lg font-semibold text-primary mb-3">
                  ${product.partner_price.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    product.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.is_active ? "Available" : "Out of Stock"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
