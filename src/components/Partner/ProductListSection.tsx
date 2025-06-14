// components/partner/ProductListSection.tsx
import React from "react";
import PartnerProductList from "@/components/Partner/PartnerProductList";
import { PartnerProduct } from "@/types/db";

interface ProductListSectionProps {
  products: PartnerProduct[];
  selectedId: string | null;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  onSelect: (product: PartnerProduct) => void;
}

const ProductListSection: React.FC<ProductListSectionProps> = ({
  products,
  selectedId,
  isLoading,
  isError,
  error,
  onSelect,
}) => {
  return (
    <div className="md:col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Listings</h2>
      <PartnerProductList
        products={products}
        selectedId={selectedId}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onSelect={onSelect}
      />
    </div>
  );
};

export default ProductListSection;