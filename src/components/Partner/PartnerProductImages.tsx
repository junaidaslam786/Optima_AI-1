// components/partner/PartnerProductImages.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
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
  newFile: File | null;
  isThumbnail: boolean;
  addLoading: boolean;
  deleteLoading: boolean;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onThumbnailChange: (val: boolean) => void;
  onAdd: (e: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}

const PartnerProductImages: React.FC<PartnerProductImagesProps> = ({
  images,
  isLoading,
  isError,
  error,

  newUrl,
  newFile,
  isThumbnail,

  onUrlChange,
  onFileChange,
  onThumbnailChange,

  onAdd,
  onDelete,

  addLoading,
  deleteLoading,
}) => {
  const [useFile, setUseFile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  // show load‐error toasts once
  useEffect(() => {
    if (isError && error) toast.error(`Error loading images: ${error.message}`);
  }, [isError, error]);

  // open delete confirmation
  const openConfirm = (id: string) => {
    setSelId(id);
    setModalOpen(true);
  };

  // actually delete
  const handleConfirmDelete = () => {
    if (selId) {
      toast.promise(
        new Promise<void>((resolve, reject) => {
          try {
            onDelete(selId);
            resolve();
          } catch (e) {
            reject(e);
          }
        }),
        {
          loading: "Deleting image...",
          success: "Image deleted!",
          error: "Failed to delete.",
        }
      );
    }
    setModalOpen(false);
    setSelId(null);
  };

  // handle add
  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!useFile && !newUrl) {
      toast.error("Enter a URL or pick a file first");
      return;
    }
    if (useFile && !newFile) {
      toast.error("Please choose a file");
      return;
    }

    toast.promise(
      new Promise<void>((resolve, reject) => {
        try {
          onAdd(e);
          resolve();
        } catch (e) {
          reject(e);
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image added!",
        error: "Upload failed.",
      }
    );
  };

  return (
    <div className="mt-10 pt-6 border-t border-secondary">
      <h3 className="text-xl font-bold text-primary mb-4">Product Images</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group overflow-hidden rounded-lg shadow-sm border border-secondary"
            >
              <Image
                src={img.image_url}
                alt=""
                width={150}
                height={150}
                unoptimized
                className="w-full h-32 object-cover"
              />
              {img.is_thumbnail && (
                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Thumbnail
                </span>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => openConfirm(img.id)}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-secondary text-center py-4">
          No images yet. Add one below!
        </p>
      )}

      {/* URL vs File toggle */}
      <div className="mb-4">
        <label className="inline-flex items-center space-x-4">
          <input
            type="radio"
            checked={!useFile}
            onChange={() => setUseFile(false)}
            className="form-radio text-primary"
          />
          <span className="text-primary">Use URL</span>
          <input
            type="radio"
            checked={useFile}
            onChange={() => setUseFile(true)}
            className="form-radio text-primary"
          />
          <span className="text-primary">Upload File</span>
        </label>
      </div>

      <form onSubmit={handleAdd} className="space-y-3">
        {useFile ? (
          <div>
            <label htmlFor="fileUpload" className="block text-primary mb-1">
              Choose File
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="w-full text-secondary"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              required={!newUrl}
            />
          </div>
        ) : (
          <Input
            id="newImageUrl"
            label="New Image URL"
            value={newUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/img.jpg"
            required={!newFile}
          />
        )}

        <Checkbox
          id="thumbnail"
          checked={isThumbnail}
          onChange={(e) => onThumbnailChange(e.target.checked)}
          label="Set as Thumbnail"
        />

        <Button type="submit" isLoading={addLoading}>
          Add Image
        </Button>
      </form>

      <ConfirmationModal
        isOpen={modalOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this image?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default PartnerProductImages;
