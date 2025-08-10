"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: PartnerProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const router = useRouter();

  const thumbnailUrl =
    product.thumbnail_url ||
    product.product_image_urls?.[0] ||
    "/medical-kit.jpg";
  const productName = product.partner_name || "Unnamed Product";
  const companyName = product.partner_profiles?.company_name || "Optima.AI";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await addToCart(product.id, 1, productName);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await addToCart(product.id, 1, productName);
    router.push('/checkout');
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full flex flex-col">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={thumbnailUrl}
            alt={productName}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = "/medical-kit.jpg";
            }}
          />
          {!product.is_active && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Product Title */}
        <Link
          href={`/products/${product.id}`}
          className="block hover:text-[rgb(79,135,162)] transition-colors duration-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {productName}
          </h3>
        </Link>

        {/* Company Name */}
        <p className="text-sm font-medium text-gray-600 mb-4 flex items-center">
          <span className="w-2 h-2 bg-[rgb(79,135,162)] rounded-full mr-2"></span>
          {companyName}
        </p>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-grow"></div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-[rgb(79,135,162)] mb-1">
            £{product.partner_price.toFixed(2)}
          </p>
          <p
            className={`text-sm font-medium ${
              product.is_active ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.is_active ? "✓ Available" : "✗ Out of Stock"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href={`/products/${product.id}`} className="flex-1">
              <Button
                variant="secondary"
                className="w-full py-3 font-semibold border-2 border-gray-200 hover:border-[rgb(79,135,162)] hover:text-[rgb(79,135,162)] transition-all duration-200"
              >
                View Details
              </Button>
            </Link>
            <Button
              onClick={handleAddToCart}
              disabled={!product.is_active || isAddingToCart}
              className="px-4 py-3 bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
              isLoading={isAddingToCart}
            >
              {!isAddingToCart && <ShoppingCart className="w-5 h-5" />}
            </Button>
          </div>
          <Button
            onClick={handleBuyNow}
            disabled={!product.is_active}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
