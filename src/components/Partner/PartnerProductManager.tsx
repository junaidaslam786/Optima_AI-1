"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { withAuth } from "@/components/Auth/withAuth";
import ProductListSection from "@/components/Partner/ProductListSection";
import PartnerProductImages from "@/components/Partner/PartnerProductImages";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { useSession } from "next-auth/react";
import {
  UpdatePartnerProduct,
  CreatePartnerProduct,
  PartnerProduct,
} from "@/redux/features/partnerProducts/partnerProductsTypes";
import { useGetPartnerProfileByUserIdQuery } from "@/redux/features/partnerProfiles/partnerProfilesApi";
import { useGetAdminProductsQuery } from "@/redux/features/adminProducts/adminProductsApi";
import {
  useCreatePartnerProductMutation,
  useUpdatePartnerProductMutation,
  useDeletePartnerProductMutation,
  useGetPartnerProductsByPartnerIdQuery,
  useGetPartnerProductByIdQuery,
} from "@/redux/features/partnerProducts/partnerProductsApi";
import PartnerProductForm from "./PartnerProductForm";

type FormState = CreatePartnerProduct & { id?: string; [key: string]: unknown };

const INITIAL_FORM: FormState = {
  admin_product_id: "",
  partner_price: 0,
  partner_name: undefined,
  partner_description: undefined,
  partner_keywords: [],
  is_active: true,
  partner_id: "",
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

const PartnerProductManager: React.FC = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState("");

  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;
  const isSessionLoading = sessionStatus === "loading";

  const { data: profileData, isLoading: profileLoading } =
    useGetPartnerProfileByUserIdQuery(userId || "", {
      skip: !userId || isSessionLoading,
      selectFromResult: ({ data, ...rest }) => ({
        data: data?.find((p) => p.user_id === userId) || null,
        ...rest,
      }),
    });

  const partnerId =
    profileData?.partner_status === "approved" ? profileData.id : null;

  const {
    data: myProducts = [],
    isLoading: myProductsLoading,
    isError: myProductsError,
    error: myProductsFetchError,
  } = useGetPartnerProductsByPartnerIdQuery(partnerId || "", {
    skip: !partnerId,
  });

  const {
    data: selectedProductDetails,
    isLoading: selectedProductDetailsLoading,
    isError: selectedProductDetailsError,
    error: selectedProductDetailsFetchError,
  } = useGetPartnerProductByIdQuery(selectedProductId || "", {
    skip: !selectedProductId,
  });

  const { data: adminProducts = [], isLoading: adminProductsLoading } =
    useGetAdminProductsQuery();

  const [
    createPartnerProduct,
    {
      isLoading: createLoading,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreatePartnerProductMutation();

  const [
    updatePartnerProduct,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdatePartnerProductMutation();

  const [
    deletePartnerProduct,
    {
      isLoading: deleteLoading,
      isSuccess: deleteSuccess,
      isError: deleteError,
      error: deleteErrorDetails,
    },
  ] = useDeletePartnerProductMutation();

  useEffect(() => {
    if (profileLoading || isSessionLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Loading user profile...");
    } else if (myProductsLoading || adminProductsLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Loading products...");
    } else if (selectedProductDetailsLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Loading product details...");
    } else if (createLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Creating listing...");
    } else if (updateLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Updating listing...");
    } else if (deleteLoading) {
      setGlobalLoading(true);
      setGlobalLoadingMessage("Deleting listing...");
    } else {
      setGlobalLoading(false);
      setGlobalLoadingMessage("");
    }
  }, [
    profileLoading,
    isSessionLoading,
    myProductsLoading,
    adminProductsLoading,
    selectedProductDetailsLoading,
    createLoading,
    updateLoading,
    deleteLoading,
  ]);

  useEffect(() => {
    if (selectedProductId && selectedProductDetails) {
      setFormState({
        id: selectedProductDetails.id,
        partner_id: selectedProductDetails.partner_id,
        admin_product_id: selectedProductDetails.admin_product_id,
        partner_price: selectedProductDetails.partner_price,
        partner_name: selectedProductDetails.partner_name ?? undefined,
        partner_description:
          selectedProductDetails.partner_description ?? undefined,
        partner_keywords: selectedProductDetails.partner_keywords || [],
        is_active: selectedProductDetails.is_active ?? true,
      });
    } else if (!selectedProductId) {
      setFormState({ ...INITIAL_FORM, partner_id: partnerId || "" });
    }
  }, [selectedProductId, selectedProductDetails, partnerId]);

  useEffect(() => {
    if (createSuccess) {
      toast.success("Listing Created Successfully!");
      setSelectedProductId(null);
      setFormState({ ...INITIAL_FORM, partner_id: partnerId || "" });
    }
    if (createError) {
      let errorMsg = "Unknown error";
      if (createErrorDetails) {
        if (
          "message" in createErrorDetails &&
          typeof createErrorDetails.message === "string"
        ) {
          errorMsg = createErrorDetails.message;
        } else if (
          "data" in createErrorDetails &&
          typeof createErrorDetails.data === "string"
        ) {
          errorMsg = createErrorDetails.data;
        }
      }
      toast.error(`Failed to create listing: ${errorMsg}`);
    }
  }, [createSuccess, createError, createErrorDetails, partnerId]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success("Listing Updated Successfully!");
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
      toast.error(`Failed to update listing: ${errorMsg}`);
    }
  }, [updateSuccess, updateError, updateErrorDetails]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Listing Deleted!");
      setSelectedProductId(null);
      setFormState({ ...INITIAL_FORM, partner_id: partnerId || "" });
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
      toast.error(`Failed to delete listing: ${errorMsg}`);
    }
  }, [deleteSuccess, deleteError, deleteErrorDetails, partnerId]);

  // --- Handlers ---
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!partnerId) {
      toast.error("Partner profile not approved or loading. Cannot submit.");
      return;
    }

    const payload: FormState = {
      ...formState,
      partner_id: partnerId,
    };

    const cleanedPayload = clean(payload);

    try {
      if (selectedProductId) {
        await updatePartnerProduct({
          id: selectedProductId,
          ...(cleanedPayload as Omit<UpdatePartnerProduct, "id">),
        }).unwrap();
      } else {
        await createPartnerProduct(
          cleanedPayload as CreatePartnerProduct
        ).unwrap();
      }
    } catch (err: unknown) {
      console.error("Submission failed:", err);
    }
  };

  const onReset = () => {
    setSelectedProductId(null);
    setFormState({ ...INITIAL_FORM, partner_id: partnerId || "" });
  };

  const onDelete = () => setConfirmOpen(true);

  const confirmDelete = async () => {
    if (selectedProductId) {
      try {
        await deletePartnerProduct(selectedProductId).unwrap();
      } catch (err) {
        console.error("Deletion failed:", err);
      }
    }
    setConfirmOpen(false);
  };

  const onSelectProduct = (product: PartnerProduct) => {
    setSelectedProductId(product.id);
  };

  const productImagesData = selectedProductId ? selectedProductDetails : null;

  return (
    <div className="container mx-auto p-6 bg-secondary/30 min-h-screen">
      <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">
        My Partner Listings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Product List Section */}
        <ProductListSection
          products={myProducts}
          selectedId={selectedProductId}
          onSelect={onSelectProduct}
          isLoading={myProductsLoading}
          isError={myProductsError}
          error={
            myProductsFetchError
              ? new Error(
                  typeof myProductsFetchError === "object" &&
                  "message" in myProductsFetchError
                    ? String(
                        (myProductsFetchError as { message?: string }).message
                      )
                    : typeof myProductsFetchError === "object" &&
                      "data" in myProductsFetchError
                    ? JSON.stringify(
                        (myProductsFetchError as { data?: unknown }).data
                      )
                    : "Unknown error"
                )
              : undefined
          }
        />

        <div className="md:col-span-2 space-y-6">
          <PartnerProductForm
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
            adminOptions={adminProducts}
          />

          {selectedProductId && productImagesData && (
            <PartnerProductImages
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

      {/* Confirmation Modal for deleting a product */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this listing and all its images?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Full Page Loader */}
      <FullPageLoader
        isLoading={globalLoading}
        message={globalLoadingMessage}
      />
    </div>
  );
};

export default withAuth(PartnerProductManager, {
  allowedRoles: ["partner"],
});
