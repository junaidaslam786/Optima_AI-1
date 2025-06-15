"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { PartnerProductWithDetails, PartnerProductImage, AdminProductImage } from "@/types/db";
import Image from "next/image";
import Alert from "@/components/ui/Alert";

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
      return api.get<PartnerProductWithDetails[]>(`/partner_products${queryString}`);
    },
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(`Failed to load products: ${error.message}`);
    }
  }, [isError, error]);

  const {
    data: partnerProductImages,
    isLoading: partnerImagesLoading,
    isError: partnerImagesError,
    error: partnerImagesFetchError
  } = useQuery<PartnerProductImage[], Error>({
    queryKey: ["partnerProductImages"],
    queryFn: async (): Promise<PartnerProductImage[]> => {
      return api.get<PartnerProductImage[]>(`/partner_product_images`);
    },
    enabled: true,
    select: (data) => data.filter((img) => img.is_thumbnail),
  });

  useEffect(() => {
    if (partnerImagesError && partnerImagesFetchError) {
      toast.error(`Failed to load partner images: ${partnerImagesFetchError.message}`);
    }
  }, [partnerImagesError, partnerImagesFetchError]);

  const {
    data: adminProductImages,
    isLoading: adminImagesLoading,
    isError: adminImagesError,
    error: adminImagesFetchError
  } = useQuery<AdminProductImage[], Error>({
    queryKey: ["adminProductImages"],
    queryFn: async (): Promise<AdminProductImage[]> => {
      return api.get<AdminProductImage[]>(`/admin_product_images`);
    },
    enabled: true,
    select: (data) => data.filter((img) => img.is_thumbnail),
  });

  useEffect(() => {
    if (adminImagesError && adminImagesFetchError) {
      toast.error(`Failed to load admin images: ${adminImagesFetchError.message}`);
    }
  }, [adminImagesError, adminImagesFetchError]);

  const getBestThumbnail = (product: PartnerProductWithDetails) => {
    const partnerThumbnail = partnerProductImages?.find(
      (img) => img.partner_product_id === product.id
    )?.image_url;

    if (partnerThumbnail) {
      return partnerThumbnail;
    }

    // CRITICAL FIX: Use product.admin_product_id instead of product.admin_products?.id
    const adminThumbnail = adminProductImages?.find(
      (img) => img.product_id === product.admin_product_id
    )?.image_url;

    if (adminThumbnail) {
      return adminThumbnail;
    }

    return "/placeholder-image.jpg";
  };

  if (isLoading || partnerImagesLoading || adminImagesLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Loading products...</p>
      </div>
    );
  }

  if (isError || partnerImagesError || adminImagesError) {
    return (
      <div className="w-full text-center text-red-600 mt-10">
        <Alert
          type="error"
          message={`Error: ${error?.message || "Failed to load products or images."}`}
        />
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto p-6 bg-primary/30">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        {partnerId
          ? `Products from ${
              partnerProducts?.[0]?.partner_profiles?.company_name || "Partner"
            }`
          : "All Partner Products"}
      </h1>
      {partnerProducts?.length === 0 ? (
        <p className="w-full text-primary text-center py-8 text-lg">
          No products found from this partner.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {partnerProducts?.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative w-full h-48">
                <Image
                  src={getBestThumbnail(product)}
                  alt={product.admin_products?.name || "Product Image"}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                  unoptimized
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
