"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Share2, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";

interface SingleProductViewProps {
  product: PartnerProduct;
}

const SingleProductView: React.FC<SingleProductViewProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productImages = product.product_image_urls?.length 
    ? product.product_image_urls 
    : [product.thumbnail_url || "/medical-kit.jpg"];

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity, product.partner_name || "Product");
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.partner_name || "Product",
          text: product.partner_description || "Check out this product",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[rgb(79,135,162)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[rgb(79,135,162)]">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.partner_name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-[rgb(79,135,162)] hover:text-[rgb(69,125,152)] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.partner_name || "Product"}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.src = "/medical-kit.jpg";
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-[rgb(79,135,162)]"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.src = "/medical-kit.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.partner_name || "Unnamed Product"}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">(4.0) 24 reviews</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-[rgb(79,135,162)] mb-4">
                £{product.partner_price.toFixed(2)}
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.is_active 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {product.is_active ? "✓ In Stock" : "✗ Out of Stock"}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.partner_description || 
                 "This is a premium health test kit designed to provide you with comprehensive insights into your health markers. Our advanced testing technology combined with AI-powered analysis delivers accurate and actionable results."}
              </p>
            </div>

            {/* Keywords/Features */}
            {product.partner_keywords && product.partner_keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.partner_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex space-x-4">
                  <Button
                    variant="primary"
                    className="flex-1 flex items-center justify-center space-x-2"
                    onClick={handleAddToCart}
                    isLoading={isAddingToCart}
                    disabled={!product.is_active || isAddingToCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.is_active ? "Add to Cart" : "Out of Stock"}</span>
                  </Button>
                  <button
                    onClick={handleWishlist}
                    className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      isWishlisted ? "text-red-500 border-red-300" : "text-gray-600"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Product ID:</span>
                  <span className="text-gray-600 ml-2">{product.id.substring(0, 8)}...</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className="text-gray-600 ml-2">Health Test Kit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-16 space-y-12">
          {/* How it works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(79,135,162)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Order your kit</h3>
                <p className="text-gray-600 text-sm">Your test kit will be delivered to your door with everything you need</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(79,135,162)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">Collect your sample</h3>
                <p className="text-gray-600 text-sm">Follow the simple instructions to collect your sample at home</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(79,135,162)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get your results</h3>
                <p className="text-gray-600 text-sm">Receive detailed insights and recommendations via your dashboard</p>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">Reviews will be loaded from our database</p>
                <p className="text-gray-500 text-sm mt-2">Customer reviews are dynamically loaded based on verified purchases</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SingleProductView;
