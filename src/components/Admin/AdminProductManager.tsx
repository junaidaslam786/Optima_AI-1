"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import AdminProductList from "@/components/Admin/AdminProductList";
import AdminProductForm from "@/components/Admin/AdminProductForm";
import AdminProductImages from "@/components/Admin/AdminProductImages";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { useSession } from "next-auth/react";
import {
  AdminProduct,
  CreateAdminProduct,
  UpdateAdminProduct,
} from "@/redux/features/adminProducts/adminProductsTypes";
import {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
} from "@/redux/features/adminProducts/adminProductsApi";

type FormState = CreateAdminProduct & { id?: string; [key: string]: unknown };

const INITIAL_FORM: FormState = {
  name: "",
  description: undefined,
  base_price: 0,
  sku: undefined,
  category_ids: [],
  intended_use: undefined,
  test_type: undefined,
  marker_ids: [],
  result_timeline: undefined,
  additional_test_information: undefined,
  corresponding_panels: [],
  admin_user_id: undefined,
};

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "") &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        out[key] = value;
      }
    }
  }
  return out;
}

const AdminProductManager: React.FC = () => {
  // --- state ---
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    error: productsFetchError,
  } = useGetAdminProductsQuery();

  const {
    data: selectedProductDetails,
    isLoading: selectedProductDetailsLoading,
    isError: selectedProductDetailsError,
    error: selectedProductDetailsFetchError,
  } = useGetAdminProductByIdQuery(selectedProductId || "", {
    skip: !selectedProductId,
  });

  const [
    createAdminProduct,
    {
      isLoading: createLoading,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreateAdminProductMutation();

  const [
    updateAdminProduct,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateAdminProductMutation();

  const [
    deleteAdminProduct,
    {
      isLoading: deleteLoading,
      isSuccess: deleteSuccess,
      isError: deleteError,
      error: deleteErrorDetails,
    },
  ] = useDeleteAdminProductMutation();

  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState("");

  useEffect(() => {
    // Determine the most relevant loading state and message
    if (productsLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Loading products...");
    } else if (selectedProductDetailsLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Loading product details...");
    } else if (createLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Creating product...");
    } else if (updateLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Updating product...");
    } else if (deleteLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Deleting product...");
    } else {
      setGlobalLoading(false);
      setGlobalLoadingMessage("");
    }
  }, [
    productsLoading,
    selectedProductDetailsLoading,
    createLoading,
    updateLoading,
    deleteLoading,
  ]);

  useEffect(() => {
    if (selectedProductId && selectedProductDetails) {
      setFormState({
        id: selectedProductDetails.id,
        name: selectedProductDetails.name,
        description: selectedProductDetails.description ?? undefined,
        base_price: selectedProductDetails.base_price,
        sku: selectedProductDetails.sku ?? undefined,
        category_ids: selectedProductDetails.category_ids || [],
        intended_use: selectedProductDetails.intended_use ?? undefined,
        test_type: selectedProductDetails.test_type ?? undefined,
        marker_ids: selectedProductDetails.marker_ids || [],
        result_timeline: selectedProductDetails.result_timeline ?? undefined,
        additional_test_information:
          selectedProductDetails.additional_test_information ?? undefined,
        corresponding_panels: selectedProductDetails.corresponding_panels || [],
        admin_user_id: selectedProductDetails.admin_user_id ?? undefined,
      });
    } else if (!selectedProductId) {
      setFormState(INITIAL_FORM);
    }
  }, [selectedProductId, selectedProductDetails]);

  useEffect(() => {
    if (createSuccess) {
      toast.success("Product Created Successfully!");
      setSelectedProductId(null);
      setFormState(INITIAL_FORM);
    }
    if (createError) {
      toast.error(
        `Failed to create product: ${
          createErrorDetails &&
          "message" in createErrorDetails &&
          typeof createErrorDetails.message === "string"
            ? createErrorDetails.message
            : createErrorDetails &&
              "data" in createErrorDetails &&
              typeof createErrorDetails.data === "string"
            ? createErrorDetails.data
            : "Unknown error"
        }`
      );
    }
  }, [createSuccess, createError, createErrorDetails]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success("Product Updated Successfully!");
    }
    if (updateError) {
      let errorMsg = "Unknown error";
      if (updateErrorDetails) {
        if (
          "message" in updateErrorDetails &&
          typeof updateErrorDetails.message === "string"
        ) {
          errorMsg = updateErrorDetails.message;
        } else if (
          "data" in updateErrorDetails &&
          typeof updateErrorDetails.data === "string"
        ) {
          errorMsg = updateErrorDetails.data;
        }
      }
      toast.error(`Failed to update product: ${errorMsg}`);
    }
  }, [updateSuccess, updateError, updateErrorDetails]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Deleted!");
      setSelectedProductId(null);
      setFormState(INITIAL_FORM);
    }
    if (deleteError) {
      let errorMsg = "Unknown error";
      if (deleteErrorDetails) {
        if (
          "message" in deleteErrorDetails &&
          typeof deleteErrorDetails.message === "string"
        ) {
          errorMsg = deleteErrorDetails.message;
        } else if (
          "data" in deleteErrorDetails &&
          typeof deleteErrorDetails.data === "string"
        ) {
          errorMsg = deleteErrorDetails.data;
        }
      }
      toast.error(`Failed to delete product: ${errorMsg}`);
    }
  }, [deleteSuccess, deleteError, deleteErrorDetails]);

  // --- Handlers ---
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: FormState = {
      ...formState,
      admin_user_id: userId,
    };

    const cleanedPayload = clean(payload);

    try {
      if (selectedProductId) {
        await updateAdminProduct({
          id: selectedProductId,
          ...(cleanedPayload as Omit<UpdateAdminProduct, "id">),
        }).unwrap();
      } else {
        await createAdminProduct(cleanedPayload as CreateAdminProduct).unwrap();
      }
    } catch (err: unknown) {
      console.error("Submission failed:", err);
    }
  };

  const onReset = () => {
    setSelectedProductId(null);
  };

  const onDelete = () => setConfirmOpen(true);

  const confirmDelete = async () => {
    if (selectedProductId) {
      try {
        await deleteAdminProduct(selectedProductId).unwrap();
      } catch {}
    }
    setConfirmOpen(false);
  };

  const onSelect = (p: AdminProduct) => setSelectedProductId(p.id);

  const productImagesData = selectedProductId ? selectedProductDetails : null;

  return (
    <div className="container mx-auto p-6 bg-secondary/30">
      <h1 className="text-4xl text-primary font-bold text-center mb-8">
        Admin Product Management
      </h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow max-h-[80vh] overflow-auto">
          <AdminProductList
            products={products}
            selectedProductId={selectedProductId}
            onSelect={onSelect}
            isLoading={productsLoading}
            isError={productsError}
            error={
              productsFetchError
                ? new Error(
                    typeof productsFetchError === "object" &&
                    "message" in productsFetchError
                      ? String(
                          (productsFetchError as { message?: string }).message
                        )
                      : typeof productsFetchError === "object" &&
                        "data" in productsFetchError
                      ? JSON.stringify(
                          (productsFetchError as { data?: unknown }).data
                        )
                      : "Unknown error"
                  )
                : undefined
            }
          />
        </div>
        <div className="md:col-span-2 space-y-6">
          <AdminProductForm
            formState={formState}
            onFormChange={(newState) =>
              setFormState((prev) => ({ ...prev, ...newState }))
            }
            onSubmit={onSubmit}
            onReset={onReset}
            onDelete={onDelete}
            isSubmitting={createLoading || updateLoading}
            isDeleting={deleteLoading}
            selectedProductId={selectedProductId}
          />
          {selectedProductId && productImagesData && (
            <AdminProductImages
              productId={selectedProductId}
              images={productImagesData.product_image_urls || []}
              thumbnail={productImagesData.thumbnail_url || null}
              isLoading={selectedProductDetailsLoading}
              isError={selectedProductDetailsError}
              error={
                selectedProductDetailsFetchError
                  ? new Error(
                      typeof selectedProductDetailsFetchError === "object" &&
                      "message" in selectedProductDetailsFetchError
                        ? String(
                            (
                              selectedProductDetailsFetchError as {
                                message?: string;
                              }
                            ).message
                          )
                        : typeof selectedProductDetailsFetchError ===
                            "object" &&
                          "data" in selectedProductDetailsFetchError
                        ? JSON.stringify(
                            (
                              selectedProductDetailsFetchError as {
                                data?: unknown;
                              }
                            ).data
                          )
                        : "Unknown error"
                    )
                  : undefined
              }
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
      <FullPageLoader
        isLoading={globalLoading}
        message={globalLoadingMessage}
      />
    </div>
  );
};

export default withAuth(AdminProductManager, { allowedRoles: ["admin"] });
