"use client";

import React from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";
import { useAddOrUpdateCartItemMutation } from "@/redux/features/cartItems/cartItemsApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  product: PartnerProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [addOrUpdateCartItem, { isLoading: isAddingToCart }] =
    useAddOrUpdateCartItemMutation();

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    try {
      await addOrUpdateCartItem({
        user_id: userId,
        partner_product_id: product.id,
        quantity: 1,
      }).unwrap();
      toast.success(`${product.partner_name || "Product"} added to cart!`);
    } catch (error: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Failed to add to cart:", error);
      let errorMessage = "An unknown error occurred.";

      if (typeof error === "object" && error !== null) {
        if ("status" in error && typeof error.status === "number") {
          // This is likely a FetchBaseQueryError
          const fetchError = error as FetchBaseQueryError;
          if (
            typeof fetchError.data === "object" &&
            fetchError.data !== null &&
            "error" in fetchError.data &&
            typeof fetchError.data.error === "string"
          ) {
            errorMessage = fetchError.data.error;
          } else {
            errorMessage = `API Error: ${fetchError.status}`;
          }
        } else if ("message" in error && typeof error.message === "string") {
          // This is likely a SerializedError or a standard Error
          errorMessage = error.message;
        }
      }
      toast.error(`Failed to add to cart: ${errorMessage}`);
    }
  };

  const thumbnailUrl =
    product.thumbnail_url ||
    product.product_image_urls?.[0] ||
    "/placeholder-image.jpg";
  const productName = product.partner_name || "Unnamed Product";
  const partnerName = product.partner_id || "Unknown Partner"; // You might want to fetch partner_profile.company_name here

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative w-full h-48">
        <Image
          src={thumbnailUrl}
          alt={productName}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          unoptimized // Use unoptimized for external URLs or if you handle optimization
          onError={(e) => {
            e.currentTarget.src = "/placeholder-image.jpg"; // Fallback on error
          }}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{productName}</h2>
        <p className="text-sm text-gray-600 mb-2">By: {partnerName}</p>
        <p className="text-lg font-semibold text-primary mb-3">
          £{product.partner_price.toFixed(2)}
        </p>
        <p
          className={`text-sm font-medium ${
            product.is_active ? "text-green-600" : "text-red-600"
          }`}
        >
          {product.is_active ? "Available" : "Out of Stock"}
        </p>
        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={handleAddToCart}
          isLoading={isAddingToCart}
          disabled={!product.is_active || isAddingToCart}
        >
          {product.is_active ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
