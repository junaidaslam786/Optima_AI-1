// components/partner/PartnerProductImages.tsx
"use client";

import React, { useState, useEffect, FormEventHandler } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";
import { PartnerProductImage } from "@/types/db";

interface PartnerProductImagesProps {
  images?: PartnerProductImage[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  newUrl: string;
  isThumbnail: boolean;
  onUrlChange: (url: string) => void;
  onThumbnailChange: (val: boolean) => void;
  onAdd: FormEventHandler<HTMLFormElement>;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
}

const PartnerProductImages: React.FC<PartnerProductImagesProps> = ({
  images,
  isLoading,
  isError,
  error,
  newUrl,
  isThumbnail,
  onUrlChange,
  onThumbnailChange,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) toast.error(error.message);
  }, [isError, error]);

  const confirmDelete = (id: string) => {
    setSelId(id);
    setModalOpen(true);
  };
  const handleConfirm = () => {
    if (selId) onDelete(selId);
    setModalOpen(false);
    setSelId(null);
  };

  return (
    <div className="mt-10 pt-6 border-t border-secondary">
      <h3 className="text-xl font-bold text-primary mb-4">Images</h3>
      {isLoading ? (
        <LoadingSpinner />
      ) : images && images.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <Image
                src={img.image_url}
                alt=""
                width={150}
                height={150}
                unoptimized
                className="rounded-lg"
              />
              <Button
                variant="danger"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => confirmDelete(img.id)}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-secondary text-center py-4">No images yet</p>
      )}
      <form onSubmit={onAdd} className="space-y-3">
        <Input
          id="imgUrl"
          label="Image URL"
          value={newUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          required
        />
        <Checkbox
          id="thumb"
          label="Thumbnail"
          checked={isThumbnail}
          onChange={(e) => onThumbnailChange(e.target.checked)}
        />
        <Button type="submit" isLoading={isAdding}>
          Add Image
        </Button>
      </form>
      <ConfirmationModal
        isOpen={modalOpen}
        title="Confirm Delete"
        description="Delete this image?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default PartnerProductImages;
