// components/Partner/CreatePartnerProductForm.tsx
"use client";

import React, { FormEventHandler, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { AdminProduct, CreatePartnerProduct } from "@/types/db";

interface CreatePartnerProductFormProps {
  formState: CreatePartnerProduct;
  adminOptions: AdminProduct[];
  onAdminSelect: (id: string) => void;
  onPriceChange: (price: number) => void;
  onAvailableChange: (available: boolean) => void;
  onFormChange: (newState: CreatePartnerProduct) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
}

const CreatePartnerProductForm: React.FC<CreatePartnerProductFormProps> = ({
  formState,
  adminOptions,
  onAdminSelect,
  onPriceChange,
  onAvailableChange,
  onFormChange,
  onSubmit,
  isSubmitting,
}) => {
  const [keywordsText, setKeywordsText] = useState(
    formState.partner_keywords?.join(", ") || ""
  );

  useEffect(() => {
    setKeywordsText(formState.partner_keywords?.join(", ") || "");
  }, [formState.partner_keywords]);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          id="adminProductId"
          label="Base Product"
          value={formState.admin_product_id}
          onChange={onAdminSelect}
          required
          options={[
            { value: "", label: "-- Select --" },
            ...adminOptions.map((ap) => ({ value: ap.id, label: ap.name })),
          ]}
          searchable
        />

        <Input
          id="partnerPrice"
          label="Selling Price"
          type="number"
          step="0.01"
          value={formState.partner_price}
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
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          onBlur={() =>
            onFormChange({
              ...formState,
              partner_keywords: keywordsText
                .split(",")
                .map((kw) => kw.trim())
                .filter((kw) => kw !== ""),
            })
          }
          placeholder="e.g. apple, banana, cherry"
        />

        <Checkbox
          id="isAvailable"
          checked={formState.is_active}
          onChange={(e) => onAvailableChange(e.target.checked)}
          label="Available for Sale"
        />

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
export default CreatePartnerProductForm;
