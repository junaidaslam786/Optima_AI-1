"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";

interface ProductCardProps {
  product: PartnerProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const thumbnailUrl =
    product.thumbnail_url ||
    product.product_image_urls?.[0] ||
    "/medical-kit.jpg";
  const productName = product.partner_name || "Unnamed Product";
  const partnerName = product.partner_profiles?.company_name || "Unknown Partner";

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full h-48">
          <Image
            src={thumbnailUrl}
            alt={productName}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = "/medical-kit.jpg";
            }}
          />
        </div>
      </Link>
      <div className="p-4">
        <Link
          href={`/products/${product.id}`}
          className="block hover:text-[rgb(79,135,162)] transition-colors"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {productName}
          </h2>
        </Link>
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
        <div className="flex space-x-2 mt-4">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
