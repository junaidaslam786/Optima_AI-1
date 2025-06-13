// components/Partner/PartnerProductForm.tsx
"use client";

import React, { FormEventHandler } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { AdminProduct } from "@/types/db";

interface PartnerProductFormProps {
  formState: {
    id?: string;
    admin_product_id: string;
    partner_price: number;
    is_active: boolean;
  };
  adminOptions: AdminProduct[];
  onAdminSelect: (id: string) => void;
  onPriceChange: (price: number) => void;
  onAvailableChange: (available: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onReset: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
}

const PartnerProductForm: React.FC<PartnerProductFormProps> = ({
  formState,
  adminOptions,
  onAdminSelect,
  onPriceChange,
  onAvailableChange,
  onSubmit,
  onReset,
  onDelete,
  isSubmitting,
  isDeleting,
}) => (
  <div className="bg-white shadow-xl rounded-lg p-6">
    <form onSubmit={onSubmit} className="space-y-4">
      <Select
        id="adminProductId"
        label="Base Product"
        value={formState.admin_product_id}
        onChange={(e) => onAdminSelect(e.target.value)}
        required
        disabled={!!formState.id}
        options={[
          { value: "", label: "-- Select --" },
          ...adminOptions.map((ap) => ({ value: ap.id, label: ap.name })),
        ]}
      />

      <Input
        id="partnerPrice"
        label="Selling Price"
        type="number"
        step="0.01"
        value={formState.partner_price}
        onChange={(e) => onPriceChange(parseFloat(e.target.value))}
        required
      />

      <Checkbox
        id="isAvailable"
        checked={formState.is_active}
        onChange={(e) => onAvailableChange(e.target.checked)}
        label="Available for Sale"
      />

      <div className="flex space-x-3 mt-6">
        <Button type="submit" isLoading={isSubmitting}>
          {formState.id ? "Update" : "Create"}
        </Button>
        {formState.id && (
          <>
            <Button type="button" variant="secondary" onClick={onReset}>
              New
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </form>
  </div>
);

export default PartnerProductForm;
