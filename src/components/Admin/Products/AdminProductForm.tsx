"use client";

import React from "react";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import MultiSelect, { Option } from "@/components/ui/MultiSelect"; // Ensure MultiSelect is correctly imported
import { useGetPanelsQuery } from "@/redux/features/panels/panelsApi";
import { useGetMarkersQuery } from "@/redux/features/markers/markersApi";
import { CreateAdminProduct } from "@/redux/features/adminProducts/adminProductsTypes"; // Correct type import
import { useGetCategoriesQuery } from "@/redux/features/categories/categoriesApi";

interface AdminProductFormProps {
  formState: CreateAdminProduct;
  onFormChange: (newState: CreateAdminProduct) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  selectedProductId: string | null;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  formState,
  onFormChange,
  onSubmit,
  onReset,
  onDelete,
  isSubmitting,
  isDeleting,
  selectedProductId,
}) => {
  const { data: panels, isLoading: isLoadingPanels } = useGetPanelsQuery();
  const { data: categories, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();
  const { data: markers, isLoading: isLoadingMarkers } = useGetMarkersQuery();

  // Prepare options for MultiSelect components
  const panelOptions: Option[] =
    panels?.map((panel) => ({ value: panel.id, label: panel.name })) || [];
  const categoryOptions: Option[] =
    categories?.map((cat) => ({ value: cat.id, label: cat.name })) || [];
  const markerOptions: Option[] =
    markers?.map((marker) => ({ value: marker.id, label: marker.marker })) ||
    [];

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-3">
        {selectedProductId ? "Edit Product" : "Create New Product"}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Basic info */}
        <Input
          id="productName"
          label="Product Name"
          value={formState.name}
          onChange={(e) => onFormChange({ ...formState, name: e.target.value })}
          required
        />

        <Textarea
          id="productDescription"
          label="Description"
          rows={3}
          value={formState.description ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, description: e.target.value })
          }
        />

        {/* Pricing & stock */}
        <Input
          id="basePrice"
          label="Base Price"
          type="number"
          step="0.01"
          required
          value={formState.base_price.toString()}
          onChange={(e) =>
            onFormChange({
              ...formState,
              base_price: parseFloat(e.target.value) || 0,
            })
          }
        />

        <Input
          id="sku"
          label="SKU"
          required
          value={formState.sku ?? ""}
          onChange={(e) => onFormChange({ ...formState, sku: e.target.value })}
        />

        {/* Category IDs - MultiSelect */}
        <MultiSelect
          id="categoryIds"
          label="Categories"
          options={categoryOptions}
          values={formState.category_ids ?? []} // Ensure default to empty array
          onChange={(values) =>
            onFormChange({ ...formState, category_ids: values })
          }
          searchable
          placeholder={
            isLoadingCategories
              ? "Loading categories..."
              : "Select categories..."
          }
          disabled={isLoadingCategories}
          required
        />

        {/* Intended Use */}
        <Input
          id="intendedUse"
          label="Intended Use"
          value={formState.intended_use ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, intended_use: e.target.value })
          }
        />

        {/* Test Type */}
        <Input
          id="testType"
          label="Test Type"
          value={formState.test_type ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, test_type: e.target.value })
          }
        />

        {/* Marker IDs - MultiSelect */}
        <MultiSelect
          id="markerIds"
          label="Associated Markers"
          options={markerOptions}
          values={formState.marker_ids ?? []} // Ensure default to empty array
          onChange={(values) =>
            onFormChange({ ...formState, marker_ids: values })
          }
          searchable
          placeholder={
            isLoadingMarkers ? "Loading markers..." : "Select markers..."
          }
          disabled={isLoadingMarkers}
        />

        {/* Result Timeline */}
        <Input
          id="resultTimeline"
          label="Result Timeline"
          placeholder="e.g., 24-48 hours"
          value={formState.result_timeline ?? ""}
          onChange={(e) =>
            onFormChange({ ...formState, result_timeline: e.target.value })
          }
        />

        {/* Additional Test Information */}
        <Textarea
          id="additionalTestInformation"
          label="Additional Test Information"
          rows={3}
          value={formState.additional_test_information ?? ""}
          onChange={(e) =>
            onFormChange({
              ...formState,
              additional_test_information: e.target.value,
            })
          }
        />

        {/* Corresponding Panels - MultiSelect */}
        <MultiSelect
          id="correspondingPanels"
          label="Corresponding Panels"
          options={panelOptions}
          values={formState.corresponding_panels ?? []} // Ensure default to empty array
          onChange={(values) =>
            onFormChange({ ...formState, corresponding_panels: values })
          }
          searchable
          placeholder={
            isLoadingPanels
              ? "Loading panels..."
              : "Select corresponding panels..."
          }
          disabled={isLoadingPanels}
        />

        {/* Buttons */}
        <div className="flex space-x-3 mt-6">
          <Button type="submit" isLoading={isSubmitting}>
            {selectedProductId ? "Update Product" : "Create Product"}
          </Button>

          {selectedProductId && (
            <>
              <Button type="button" variant="secondary" onClick={onReset}>
                New Product
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                isLoading={isDeleting}
              >
                Delete Product
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;