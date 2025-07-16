// components/Admin/ProductList.tsx
"use client";

import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AdminProduct } from "@/redux/features/adminProducts/adminProductsTypes";

interface AdminProductListProps {
  products?: AdminProduct[];
  selectedProductId: string | null;
  onSelect: (product: AdminProduct) => void;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

const AdminProductList: React.FC<AdminProductListProps> = ({
  products,
  selectedProductId,
  onSelect,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading)
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );

  if (isError)
    return (
      <p className="text-secondary">Error loading products: {error?.message}</p>
    );

  if (!products || products.length === 0)
    return (
      <p className="text-secondary text-center py-4">
        No products found. Create one!
      </p>
    );

  return (
    <ul className="divide-y divide-secondary">
      {products.map((product) => (
        <li
          key={product.id}
          className={`py-3 px-4 cursor-pointer hover:bg-primary/5 rounded-md
            ${
              selectedProductId === product.id
                ? "bg-primary/10 font-semibold"
                : ""
            }`}
          onClick={() => onSelect(product)}
        >
          <p className="text-primary">{product.name}</p>
          <p className="text-secondary text-sm">SKU: {product.sku}</p>
        </li>
      ))}
    </ul>
  );
};

export default AdminProductList;
