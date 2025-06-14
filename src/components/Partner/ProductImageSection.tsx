// components/partner/ProductImageSection.tsx
import React, { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import PartnerProductImages from "@/components/Partner/PartnerProductImages";
import { PartnerProductImage } from "@/types/db";

interface ProductImageSectionProps {
  images: PartnerProductImage[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  selectedProductId: string | null;
  addImageMut: UseMutationResult<
    PartnerProductImage,
    Error,
    { partner_product_id: string; image_url: string; is_thumbnail: boolean }
  >;
  delImageMut: UseMutationResult<null, Error, string>;
}

const ProductImageSection: React.FC<ProductImageSectionProps> = ({
  images,
  isLoading,
  isError,
  error,
  selectedProductId,
  addImageMut,
  delImageMut,
}) => {
  const [newUrl, setNewUrl] = useState<string>("");
  const [isThumbnail, setIsThumbnail] = useState<boolean>(false);

  const handleAddImage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Select a listing first");
      return;
    }
    if (!newUrl) {
      toast.error("Provide an image URL");
      return;
    }
    addImageMut.mutate(
      {
        partner_product_id: selectedProductId,
        image_url: newUrl,
        is_thumbnail: isThumbnail,
      },
      {
        onSuccess: () => {
          setNewUrl("");
          setIsThumbnail(false);
        },
      }
    );
  };

  const handleDeleteImage = (id: string) => {
    delImageMut.mutate(id);
  };

  return (
    <PartnerProductImages
      images={images}
      isLoading={isLoading}
      isError={isError}
      error={error}
      newUrl={newUrl}
      newFile={null} // Assuming file uploads are not handled directly here
      isThumbnail={isThumbnail}
      onUrlChange={setNewUrl}
      onFileChange={() => {}} // Keep as no-op or implement if needed
      onThumbnailChange={setIsThumbnail}
      onAdd={handleAddImage}
      onDelete={handleDeleteImage}
      addLoading={addImageMut.isPending}
      deleteLoading={delImageMut.isPending}
    />
  );
};

export default ProductImageSection;