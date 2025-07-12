"use client";

import React, { useEffect, useState } from "react";
import { CreatePartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes"; // Correct type import
import { AdminProduct } from "@/redux/features/adminProducts/adminProductsTypes";
import Select from "../ui/Select";
import Input from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Checkbox } from "../ui/Checkbox";
import Button from "../ui/Button";

interface PartnerProductFormProps {
  formState: CreatePartnerProduct;
  adminOptions: AdminProduct[];
  onFormChange: (newState: CreatePartnerProduct) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  selectedProductId: string | null;
}

const PartnerProductForm: React.FC<PartnerProductFormProps> = ({
  formState,
  adminOptions,
  onFormChange,
  onSubmit,
  onReset,
  onDelete,
  isSubmitting,
  isDeleting,
  selectedProductId,
}) => {
  // State to manage keywords as a comma-separated string for the Input component
  const [keywordsText, setKeywordsText] = useState(
    formState.partner_keywords?.join(", ") || ""
  );

  // Effect to update keywordsText when formState.partner_keywords changes (e.g., when loading an existing product)
  useEffect(() => {
    setKeywordsText(formState.partner_keywords?.join(", ") || "");
  }, [formState.partner_keywords]);

  // Handle blur event for keywords input to parse the string into an array
  const handleKeywordsBlur = () => {
    onFormChange({
      ...formState,
      partner_keywords: keywordsText
        .split(",")
        .map((kw) => kw.trim())
        .filter((kw) => kw !== ""), // Filter out empty strings
    });
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-3">
        {selectedProductId
          ? "Edit Partner Product"
          : "Create New Partner Product"}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Base Product selection */}
        <Select
          id="adminProductId"
          label="Base Product"
          value={formState.admin_product_id}
          onChange={(value: string) =>
            onFormChange({ ...formState, admin_product_id: value })
          }
          required
          options={[
            { value: "", label: "-- Select --" },
            ...adminOptions.map((ap) => ({ value: ap.id, label: ap.name })),
          ]}
          searchable
          placeholder="Select a base product..."
        />

        {/* Selling Price */}
        <Input
          id="partnerPrice"
          label="Selling Price"
          type="number"
          step="0.01"
          value={formState.partner_price.toString()} // Convert number to string for input value
          onChange={(e) =>
            onFormChange({
              ...formState,
              partner_price: parseFloat(e.target.value) || 0, // Parse string to float
            })
          }
          required
        />

        {/* Your Product Name */}
        <Input
          id="partnerName"
          label="Your Product Name"
          value={formState.partner_name ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, partner_name: e.target.value })
          }
        />

        {/* Your Product Description */}
        <Textarea
          id="partnerDescription"
          label="Your Product Description"
          rows={3}
          value={formState.partner_description ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, partner_description: e.target.value })
          }
        />

        {/* Keywords */}
        <Input
          id="partnerKeywords"
          label="Keywords (comma-separated)"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          onBlur={handleKeywordsBlur} // Call blur handler to update formState with parsed keywords
          placeholder="e.g. apple, banana, cherry"
        />

        {/* Available for Sale Checkbox */}
        <Checkbox
          id="isAvailable"
          checked={formState.is_active ?? false} // Default to false if undefined
          onChange={(e) =>
            onFormChange({ ...formState, is_active: e.target.checked })
          }
          label="Available for Sale"
        />

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <Button type="submit" isLoading={isSubmitting}>
            {selectedProductId
              ? "Update Partner Product"
              : "Create Partner Product"}
          </Button>

          {selectedProductId && (
            <>
              {/* New Product button, shown only when an existing product is selected */}
              <Button type="button" variant="secondary" onClick={onReset}>
                New Partner Product
              </Button>
              {/* Delete Product button, shown only when an existing product is selected */}
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                isLoading={isDeleting}
              >
                Delete Partner Product
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default PartnerProductForm;
