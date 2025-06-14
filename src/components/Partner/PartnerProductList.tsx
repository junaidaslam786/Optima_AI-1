// components/Partner/PartnerProductList.tsx
"use client";

import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PartnerProduct } from "@/types/db";

interface PartnerProductListProps {
  products?: PartnerProduct[];
  selectedId: string | null;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  onSelect: (p: PartnerProduct) => void;
}

const PartnerProductList: React.FC<PartnerProductListProps> = ({
  products,
  selectedId,
  isLoading,
  isError,
  error,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }
  if (isError) {
    return <p className="text-secondary">Error: {error?.message}</p>;
  }
  if (!products || products.length === 0) {
    return <p className="text-secondary text-center py-4">No listings yet.</p>;
  }
  return (
    <ul className="divide-y divide-secondary">
      {products.map((p) => (
        <li
          key={p.id}
          className={`py-3 px-4 cursor-pointer rounded-md hover:bg-primary\/5 ${
            selectedId === p.id ? "bg-primary/10 font-semibold" : ""
          }`}
          onClick={() => onSelect(p)}
        >
          <p className="text-primary text-lg">{p.partner_name}</p>
          <p className="text-secondary text-sm">
            Price: ${p.partner_price}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default PartnerProductList;
