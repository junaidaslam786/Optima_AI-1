// components/Admin/AdminProductManager.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import AdminProductList from "@/components/Admin/AdminProductList";
import AdminProductForm from "@/components/Admin/AdminProductForm";
import AdminProductImages from "@/components/Admin/AdminProductImages";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  AdminProduct,
  AdminProductImage,
  CreateAdminProduct,
} from "@/types/db";
import { useSession } from "next-auth/react";

type FormState = CreateAdminProduct & { id?: string };

// Initial empty form
const INITIAL_FORM: FormState = {
  name: "",
  description: "",
  base_price: 0,
  sku: "",
  barcode: "",
  category: "",
  brand: "",
  weight: 0,
  dimensions: "",
  stock_quantity: 0,
  is_active: true,
  admin_user_id: "",
  manufacturer: "",
  model_number: "",
  intended_use: "",
  test_type: "",
  sample_type: [],
  results_time: "",
  storage_conditions: "",
  regulatory_approvals: [],
  kit_contents_summary: "",
  user_manual_url: "",
  warnings_and_precautions: [],
};

// Helper to strip empty or undefined fields
function clean(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (
      v !== undefined &&
      v !== null &&
      !(typeof v === "string" && v.trim() === "") &&
      !(Array.isArray(v) && v.length === 0)
    ) {
      out[k] = v;
    }
  });
  return out;
}

const AdminProductManager: React.FC = () => {
  const qc = useQueryClient();

  // --- state ---
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // --- queries ---
  const productsQ = useQuery<AdminProduct[], Error>({
    queryKey: ["adminProducts"],
    queryFn: () => api.get("/admin_products"),
  });

  const imagesQ = useQuery<AdminProductImage[], Error>({
    queryKey: ["adminProductImages", selectedProductId],
    queryFn: () =>
      api.get(`/admin_product_images?product_id=${selectedProductId}`),
    enabled: Boolean(selectedProductId),
  });

  // --- mutations ---
  const createM = useMutation<AdminProduct, Error, FormState>({
    mutationFn: (newP) => {
      const { ...rest } = newP;
      return api.post("/admin_products", clean(rest));
    },
    onSuccess: () => {
      toast.success("Created!");
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      setSelectedProductId(null);
      setFormState(INITIAL_FORM);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateM = useMutation<AdminProduct, Error, FormState>({
    mutationFn: (upd) => {
      if (!upd.id) throw new Error("Missing ID");
      const { id, ...rest } = upd;
      return api.patch(`/admin_products/${id}`, clean(rest));
    },
    onSuccess: () => {
      toast.success("Updated!");
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteM = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/admin_products/${id}`),
    onSuccess: () => {
      toast.success("Deleted!");
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      setSelectedProductId(null);
      setFormState(INITIAL_FORM);
    },
    onError: (e) => toast.error(e.message),
  });

  const addImgM = useMutation<
    AdminProductImage,
    Error,
    FormData | Record<string, unknown>
  >({
    mutationFn: (payload) =>
      payload instanceof FormData
        ? fetch("/api/admin_product_images", {
            method: "POST",
            body: payload,
          }).then((r) => {
            if (!r.ok) throw new Error("Upload failed");
            return r.json();
          })
        : api.post("/admin_product_images", payload),
    onSuccess: () => {
      toast.success("Image added!");
      qc.invalidateQueries({
        queryKey: ["adminProductImages", selectedProductId],
      });
      setNewImgUrl("");
      setNewFile(null);
      setThumbnail(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteImgM = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/admin_product_images/${id}`),
    onSuccess: () => {
      toast.success("Image removed!");
      qc.invalidateQueries({
        queryKey: ["adminProductImages", selectedProductId],
      });
    },
    onError: (e) => toast.error(e.message),
  });

  // --- sync form when selection changes ---
  useEffect(() => {
    if (selectedProductId && productsQ.data) {
      const p = productsQ.data.find((x) => x.id === selectedProductId);
      if (p) {
        setFormState({
          ...p,
          sample_type: p.sample_type || [],
          regulatory_approvals: p.regulatory_approvals || [],
          warnings_and_precautions: p.warnings_and_precautions || [],
        });
      }
    } else {
      setFormState(INITIAL_FORM);
    }
  }, [selectedProductId, productsQ.data]);

  // --- handlers ---
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: FormState = {
      ...formState,
      admin_user_id: userId,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectedProductId ? updateM.mutate(payload) : createM.mutate(payload);
  };

  const onReset = () => setSelectedProductId(null);
  const onDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    if (selectedProductId) deleteM.mutate(selectedProductId);
    setConfirmOpen(false);
  };

  const onAddImage = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    if (newFile) {
      const fd = new FormData();
      fd.append("product_id", selectedProductId);
      fd.append("file", newFile);
      fd.append("is_thumbnail", JSON.stringify(thumbnail));
      addImgM.mutate(fd);
    } else {
      addImgM.mutate({
        product_id: selectedProductId,
        image_url: newImgUrl,
        is_thumbnail: thumbnail,
      });
    }
  };

  const onSelect = (p: AdminProduct) => setSelectedProductId(p.id);

  return (
    <div className="container mx-auto p-6 bg-secondary/30">
      <h1 className="text-4xl font-bold text-center mb-8">
        Admin Product Management
      </h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow max-h-[80vh] overflow-auto">
          <AdminProductList
            products={productsQ.data}
            selectedProductId={selectedProductId}
            onSelect={onSelect}
            isLoading={productsQ.isLoading}
            isError={productsQ.isError}
            error={productsQ.error ?? undefined}
          />
        </div>
        <div className="md:col-span-2 space-y-6">
          <AdminProductForm
            formState={formState}
            onFormChange={setFormState}
            onSubmit={onSubmit}
            onReset={onReset}
            onDelete={onDelete}
            isSubmitting={createM.isPending || updateM.isPending}
            isDeleting={deleteM.isPending}
            selectedProductId={selectedProductId}
          />
          {selectedProductId && (
            <AdminProductImages
              images={imagesQ.data}
              isLoading={imagesQ.isLoading}
              isError={imagesQ.isError}
              error={imagesQ.error ?? undefined}
              newImageUrl={newImgUrl}
              newFile={newFile}
              isThumbnail={thumbnail}
              onImageUrlChange={setNewImgUrl}
              onFileChange={setNewFile}
              onThumbnailChange={setThumbnail}
              onAddImage={onAddImage}
              onDeleteImage={(id) => deleteImgM.mutate(id)}
              addLoading={addImgM.isPending}
              deleteLoading={deleteImgM.isPending}
            />
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this product?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default withAuth(AdminProductManager, { allowedRoles: ["admin"] });
