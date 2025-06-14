// components/partner/ProductFormSection.tsx
import React from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import CreatePartnerProductForm from "@/components/Partner/CreatePartnerProductForm";
import UpdatePartnerProductForm from "@/components/Partner/UpdatePartnerProductForm";
import {
  AdminProduct,
  CreatePartnerProduct,
  PartnerProduct,
  UpdatePartnerProduct,
} from "@/types/db";

interface ProductFormSectionProps {
  selectedId: string | null;
  form: UpdatePartnerProduct;
  setForm: React.Dispatch<React.SetStateAction<UpdatePartnerProduct>>;
  partnerId: string | null;
  adminProducts: AdminProduct[];
  createMut: UseMutationResult<PartnerProduct, Error, CreatePartnerProduct>;
  updateMut: UseMutationResult<PartnerProduct, Error, UpdatePartnerProduct>;
  deleteMut: UseMutationResult<null, Error, string>;
  resetForm: () => void;
  openDeleteModal: () => void;
}

const ProductFormSection: React.FC<ProductFormSectionProps> = ({
  selectedId,
  form,
  setForm,
  partnerId,
  adminProducts,
  createMut,
  updateMut,
  deleteMut,
  resetForm,
  openDeleteModal,
}) => {
  const handleAdminSelect = (admin_product_id: string) => {
    const base = adminProducts.find((p) => p.id === admin_product_id);
    setForm((f) => ({
      ...f,
      admin_product_id,
      partner_price: base ? base.base_price : f.partner_price,
      partner_name: base ? base.name : f.partner_name,
      partner_description: base ? base.description : f.partner_description,
    }));
  };

  const handlePriceChange = (partner_price: number) => {
    setForm((f) => ({ ...f, partner_price }));
  };

  const handleAvailableChange = (is_active: boolean) => {
    setForm((f) => ({ ...f, is_active }));
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!partnerId) {
      toast.error("Partner ID is missing.");
      return;
    }
    const payload: Omit<CreatePartnerProduct, "id"> & { partner_id: string } = {
      partner_id: partnerId,
      admin_product_id: form.admin_product_id!,
      partner_price: form.partner_price!,
      is_active: form.is_active!,
      ...(form.partner_name && { partner_name: form.partner_name }),
      ...(form.partner_description && {
        partner_description: form.partner_description,
      }),
      ...(form.partner_keywords && {
        partner_keywords: form.partner_keywords,
      }),
    };
    createMut.mutate(payload);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMut.mutate(form);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-4">
        {selectedId ? "Edit Listing" : "Create New Listing"}
      </h2>
      {!selectedId ? (
        <CreatePartnerProductForm
          formState={{
            partner_id: partnerId!,
            admin_product_id: form.admin_product_id!,
            partner_price: form.partner_price ?? 0,
            partner_name: form.partner_name,
            partner_description: form.partner_description,
            partner_keywords: form.partner_keywords,
            is_active: form.is_active ?? false,
          }}
          adminOptions={adminProducts}
          onAdminSelect={handleAdminSelect}
          onPriceChange={handlePriceChange}
          onAvailableChange={handleAvailableChange}
          onFormChange={(newState) => setForm((prev) => ({ ...prev, ...newState }))}
          onSubmit={handleCreateSubmit}
          isSubmitting={createMut.isPending}
        />
      ) : (
        <UpdatePartnerProductForm
          formState={form}
          adminOptions={adminProducts}
          onAdminSelect={handleAdminSelect}
          onPriceChange={handlePriceChange}
          onAvailableChange={handleAvailableChange}
          onFormChange={setForm}
          onSubmit={handleUpdateSubmit}
          onReset={resetForm}
          onDelete={openDeleteModal}
          isSubmitting={updateMut.isPending}
          isDeleting={deleteMut.isPending}
        />
      )}
    </>
  );
};

export default ProductFormSection;