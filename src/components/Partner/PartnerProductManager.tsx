// components/partner/PartnerProductManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import PartnerProductList from "@/components/Partner/PartnerProductList";
import PartnerProductForm from "@/components/Partner/PartnerProductForm";
import PartnerProductImages from "@/components/Partner/PartnerProductImages";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const [form, setForm] = useState<UpdatePartnerProduct>({
    id: "",
    partner_id: "",
    admin_product_id: "",
    partner_price: 0,
    is_active: true,
  });
  const [newUrl, setNewUrl] = useState<string>("");
  const [isThumbnail, setIsThumbnail] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // 1) Load my partner profile
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

  // 2) All admin products for dropdown
  const { data: adminProducts = [] } = useQuery<AdminProduct[], Error>({
    queryKey: ["allAdminProducts"],
    queryFn: () => api.get("/admin_products"),
  });

  // 3) My partner listings
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

  // 4) Images for the selected listing
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

  // — Mutations —
  const createMut = useMutation<
    PartnerProduct,
    Error,
    Omit<PartnerProduct, "id"> & { partner_id: string }
  >({
    mutationFn: (newListing) => api.post("/partner_products", newListing),
    onSuccess: () => {
      toast.success("Listing created!");
      if (partnerId) {
        qc.invalidateQueries({
          queryKey: ["myPartnerProducts", partnerId],
        });
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
    mutationFn: ({ id, ...body }) => api.patch(`/partner_products/${id}`, body),
    onSuccess: () => {
      toast.success("Listing updated!");
      if (partnerId) {
        qc.invalidateQueries({
          queryKey: ["myPartnerProducts", partnerId],
        });
      }
    },
    onError: (e) => toast.error(`Update failed: ${e.message}`),
  });

  const deleteMut = useMutation<null, Error, string>({
    mutationFn: (id) => api.delete(`/partner_products/${id}`),
    onSuccess: () => {
      toast.success("Listing deleted!");
      if (partnerId) {
        qc.invalidateQueries({
          queryKey: ["myPartnerProducts", partnerId],
        });
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
      setNewUrl("");
      setIsThumbnail(false);
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

  // — Handlers —
  const handleSelect = (p: PartnerProduct) => {
    setSelectedId(p.id);
    setForm({
      id: p.id,
      partner_id: user?.id ?? "",
      admin_product_id: p.admin_product_id,
      partner_price: p.partner_price,
      is_active: p.is_active,
    });
  };

  const handleAdminSelect = (admin_product_id: string) => {
    const base = adminProducts.find((p) => p.id === admin_product_id);
    setForm((f) => ({
      ...f,
      admin_product_id,
      partner_price: base ? base.base_price : f.partner_price,
    }));
  };

  const handlePriceChange = (partner_price: number) => {
    setForm((f) => ({ ...f, partner_price }));
  };

  const handleAvailableChange = (is_active: boolean) => {
    setForm((f) => ({ ...f, is_active }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!partnerId) {
      toast.error("Your partner profile isn't approved yet");
      return;
    }
    form.id
      ? updateMut.mutate(form)
      : createMut.mutate({ ...form, partner_id: partnerId });
  };

  const openDeleteModal = () => setShowDeleteModal(true);
  const confirmDelete = () => {
    if (selectedId) deleteMut.mutate(selectedId);
    setShowDeleteModal(false);
  };

  const handleAddImage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error("Select a listing first");
      return;
    }
    if (!newUrl) {
      toast.error("Provide an image URL");
      return;
    }
    addImageMut.mutate({
      partner_product_id: selectedId,
      image_url: newUrl,
      is_thumbnail: isThumbnail,
    });
  };

  const handleDeleteImage = (id: string) => {
    delImageMut.mutate(id);
  };

  // — Guards & render —
  if (loading) return <LoadingSpinner />;
  if (!user) return <p className="text-primary">Please sign in to continue</p>;
  if (!partnerId)
    return (
      <p className="text-secondary">
        Your partner account is not yet approved.
      </p>
    );

  return (
    <div className="container mx-auto p-6 bg-secondary/30 min-h-screen">
      <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">
        My Partner Listings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LIST */}
        <div className="md:col-span-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Listings</h2>
          <PartnerProductList
            products={myProducts}
            selectedId={selectedId}
            isLoading={myProductsLoading}
            isError={myProductsError}
            error={myProductsErrorObj ?? undefined}
            onSelect={handleSelect}
          />
        </div>

        {/* FORM */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {selectedId ? "Edit Listing" : "Create New Listing"}
          </h2>
          <PartnerProductForm
            formState={form}
            adminOptions={adminProducts}
            onAdminSelect={handleAdminSelect}
            onPriceChange={handlePriceChange}
            onAvailableChange={handleAvailableChange}
            onSubmit={handleSubmit}
            onReset={() => {
              setSelectedId(null);
              setForm({
                id: "",
                partner_id: "",
                admin_product_id: "",
                partner_price: 0,
                is_active: true,
              });
            }}
            onDelete={openDeleteModal}
            isSubmitting={createMut.isPending || updateMut.isPending}
            isDeleting={deleteMut.isPending}
          />

          {selectedId && (
            <PartnerProductImages
              images={images}
              isLoading={imagesLoading}
              isError={imagesError}
              error={imagesErrorObj ?? undefined}
              newUrl={newUrl}
              isThumbnail={isThumbnail}
              onUrlChange={setNewUrl}
              onThumbnailChange={setIsThumbnail}
              onAdd={handleAddImage}
              onDelete={handleDeleteImage}
              isAdding={addImageMut.isPending}
              isDeleting={delImageMut.isPending}
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
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default withAuth(PartnerProductManager, {
  allowedRoles: ["partner"],
});
