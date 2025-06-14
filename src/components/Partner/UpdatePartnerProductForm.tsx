// components/Partner/UpdatePartnerProductForm.tsx
"use client";

import React, { FormEventHandler } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { AdminProduct, UpdatePartnerProduct } from "@/types/db";

interface UpdatePartnerProductFormProps {
  formState: UpdatePartnerProduct;
  adminOptions: AdminProduct[];
  onAdminSelect: (id: string) => void;
  onPriceChange: (price: number) => void;
  onAvailableChange: (available: boolean) => void;
  onFormChange: (newState: UpdatePartnerProduct) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onReset: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
}

const UpdatePartnerProductForm: React.FC<UpdatePartnerProductFormProps> = ({
  formState,
  adminOptions,
  onAdminSelect,
  onPriceChange,
  onAvailableChange,
  onFormChange,
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
        value={formState.admin_product_id!}
        onChange={onAdminSelect}
        disabled
        options={adminOptions.map((ap) => ({
          value: ap.id,
          label: ap.name,
        }))}
      />

      <Input
        id="partnerPrice"
        label="Selling Price"
        type="number"
        step="0.01"
        value={formState.partner_price!}
        onChange={(e) => onPriceChange(Number(e.target.value))}
        required
      />

      <Input
        id="partnerName"
        label="Your Product Name"
        value={formState.partner_name ?? ""}
        onChange={(e) =>
          onFormChange({ ...formState, partner_name: e.target.value })
        }
      />

      <Textarea
        id="partnerDescription"
        label="Your Product Description"
        rows={3}
        value={formState.partner_description ?? ""}
        onChange={(e) =>
          onFormChange({ ...formState, partner_description: e.target.value })
        }
      />

      <Input
        id="partnerKeywords"
        label="Keywords (comma-separated)"
        value={formState.partner_keywords?.join(", ") ?? ""}
        onChange={(e) =>
          onFormChange({
            ...formState,
            partner_keywords: e.target.value
              .split(",")
              .map((kw) => kw.trim())
              .filter((kw) => kw),
          })
        }
      />

      <Checkbox
        id="isAvailable"
        checked={formState.is_active!}
        onChange={(e) => onAvailableChange(e.target.checked)}
        label="Available for Sale"
      />

      <div className="flex space-x-3 justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Update
        </Button>
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
      </div>
    </form>
  </div>
);

export default UpdatePartnerProductForm;
