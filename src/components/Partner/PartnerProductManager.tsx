// components/partner/PartnerProductManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import ProductListSection from "@/components/Partner/ProductListSection";
import ProductFormSection from "@/components/Partner/ProductFormSection";
import ProductImageSection from "@/components/Partner/ProductImageSection";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { api } from "@/lib/api-client";
import {
  PartnerProfile,
  AdminProduct,
  PartnerProduct,
  PartnerProductImage,
  CreatePartnerProduct,
  UpdatePartnerProduct,
} from "@/types/db";


const PartnerProductManager: React.FC = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";
  const qc = useQueryClient();

  // State
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [form, setForm] = useState<UpdatePartnerProduct>({
    id: "",
    partner_id: "",
    admin_product_id: "",
    partner_price: 0,
    is_active: true,
  });

  // Data Queries
  const { data: profile } = useQuery<
    PartnerProfile[],
    Error,
    PartnerProfile | null
  >({
    queryKey: ["myPartnerProfile", user?.id],
    queryFn: () => api.get(`/partner_profiles?user_id=${user?.id}`),
    enabled: !!user?.id && !loading,
    select: (arr) => arr[0] || null,
  });

  useEffect(() => {
    if (profile?.partner_status === "approved") {
      setPartnerId(profile.id);
    } else {
      setPartnerId(null);
    }
  }, [profile]);

  const { data: adminProducts = [] } = useQuery<AdminProduct[], Error>({
    queryKey: ["allAdminProducts"],
    queryFn: () => api.get("/admin_products"),
  });

  const {
    data: myProducts = [],
    isLoading: myProductsLoading,
    isError: myProductsError,
    error: myProductsErrorObj,
  } = useQuery<PartnerProduct[], Error>({
    queryKey: ["myPartnerProducts", partnerId],
    queryFn: () => api.get(`/partner_products?partner_id=${partnerId}`),
    enabled: !!partnerId,
  });

  const {
    data: images = [],
    isLoading: imagesLoading,
    isError: imagesError,
    error: imagesErrorObj,
  } = useQuery<PartnerProductImage[], Error>({
    queryKey: ["partnerProductImages", selectedId],
    queryFn: () =>
      api.get(`/partner_product_images?partner_product_id=${selectedId}`),
    enabled: !!selectedId,
  });

  // Mutations
  const createMut = useMutation<PartnerProduct, Error, CreatePartnerProduct>({
    mutationFn: (newListing) =>
      api.post(
        "/partner_products",
        newListing as unknown as Record<string, unknown>
      ),
    onSuccess: () => {
      toast.success("Listing created!");
      if (partnerId) {
        qc.invalidateQueries({ queryKey: ["myPartnerProducts", partnerId] });
      }
      setForm({
        id: "",
        partner_id: "",
        admin_product_id: "",
        partner_price: 0,
        is_active: true,
      });
    },
    onError: (e) => toast.error(`Create failed: ${e.message}`),
  });

  const updateMut = useMutation<PartnerProduct, Error, UpdatePartnerProduct>({
    mutationFn: ({ id, ...body }) =>
      api.patch(`/partner_products/${id}`, body),
    onSuccess: () => {
      toast.success("Listing updated!");
      if (partnerId) {
        qc.invalidateQueries({ queryKey: ["myPartnerProducts", partnerId] });
      }
    },
    onError: (e) => toast.error(`Update failed: ${e.message}`),
  });

  const deleteMut = useMutation<null, Error, string>({
    mutationFn: (id) => api.delete(`/partner_products/${id}`),
    onSuccess: () => {
      toast.success("Listing deleted!");
      if (partnerId) {
        qc.invalidateQueries({ queryKey: ["myPartnerProducts", partnerId] });
      }
      setSelectedId(null);
      setForm({
        id: "",
        partner_id: "",
        admin_product_id: "",
        partner_price: 0,
        is_active: true,
      });
    },
    onError: (e) => toast.error(`Delete failed: ${e.message}`),
  });

  const addImageMut = useMutation<
    PartnerProductImage,
    Error,
    { partner_product_id: string; image_url: string; is_thumbnail: boolean }
  >({
    mutationFn: (img) => api.post("/partner_product_images", img),
    onSuccess: () => {
      toast.success("Image added!");
      if (selectedId) {
        qc.invalidateQueries({
          queryKey: ["partnerProductImages", selectedId],
        });
      }
    },
    onError: (e) => toast.error(`Add image failed: ${e.message}`),
  });

  const delImageMut = useMutation<null, Error, string>({
    mutationFn: (id) => api.delete(`/partner_product_images/${id}`),
    onSuccess: () => {
      toast.success("Image removed!");
      if (selectedId) {
        qc.invalidateQueries({
          queryKey: ["partnerProductImages", selectedId],
        });
      }
    },
    onError: (e) => toast.error(`Remove image failed: ${e.message}`),
  });

  // Handlers (passed down to children)
  const handleSelectProduct = (p: PartnerProduct) => {
    setSelectedId(p.id);
    setForm({
      id: p.id,
      admin_product_id: p.admin_product_id,
      partner_price: p.partner_price,
      is_active: p.is_active,
      partner_name: p.partner_name ?? "",
      partner_description: p.partner_description ?? "",
      partner_keywords: p.partner_keywords ?? [],
    });
  };

  const resetProductForm = () => {
    setSelectedId(null);
    setForm({
      id: "",
      partner_id: "",
      admin_product_id: "",
      partner_price: 0,
      is_active: true,
    });
  };

  const confirmDeleteProduct = () => {
    if (selectedId) deleteMut.mutate(selectedId);
    setShowDeleteModal(false);
  };

  return (
    <div className="container mx-auto p-6 bg-secondary/30 min-h-screen">
      <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">
        My Partner Listings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ProductListSection
          products={myProducts}
          selectedId={selectedId}
          isLoading={myProductsLoading}
          isError={myProductsError}
          error={myProductsErrorObj ?? undefined}
          onSelect={handleSelectProduct}
        />

        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <ProductFormSection
            selectedId={selectedId}
            form={form}
            setForm={setForm}
            partnerId={partnerId}
            adminProducts={adminProducts}
            createMut={createMut}
            updateMut={updateMut}
            deleteMut={deleteMut}
            resetForm={resetProductForm}
            openDeleteModal={() => setShowDeleteModal(true)}
          />

          {selectedId && (
            <ProductImageSection
              images={images}
              isLoading={imagesLoading}
              isError={imagesError}
              error={imagesErrorObj ?? undefined}
              selectedProductId={selectedId}
              addImageMut={addImageMut}
              delImageMut={delImageMut}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        description="Are you sure you want to delete this listing and all its images?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default withAuth(PartnerProductManager, {
  allowedRoles: ["partner"],
});
