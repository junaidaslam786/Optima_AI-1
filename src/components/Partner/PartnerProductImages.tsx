// components/partner/PartnerProductImages.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast"; // Keep toast for local validations
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
  onAdd: (e: FormEvent<HTMLFormElement>) => void; // This will trigger the parent's mutation
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
  onAdd, // We will call this directly after client-side validation
  onDelete,
  addLoading,
  deleteLoading,
}) => {
  const [useFile, setUseFile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) toast.error(`Error loading images: ${error.message}`);
  }, [isError, error]);

  const openConfirm = (id: string) => {
    setSelId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selId) {
      toast.promise(
        new Promise<void>((resolve, reject) => {
          try {
            onDelete(selId); // Calls parent's onDelete (which calls delImageMut.mutate)
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

  const validateImage = (
    width: number,
    height: number
  ): { isValid: boolean; message?: string } => {
    const minSize = 480;
    const maxSize = 720;

    if (width < minSize || height < minSize) {
      return {
        isValid: false,
        message: `Image dimensions must be at least ${minSize}x${minSize} pixels.`,
      };
    }
    if (width > maxSize || height > maxSize) {
      return {
        isValid: false,
        message: `Image dimensions must be at most ${maxSize}x${maxSize} pixels.`,
      };
    }
    if (width !== height) {
      return {
        isValid: false,
        message: "Image must have a 1:1 aspect ratio (square).",
      };
    }
    return { isValid: true };
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side input validation
    if (useFile && !newFile) {
      toast.error("Please choose a file to upload.");
      return;
    }
    if (!useFile && !newUrl) {
      toast.error("Please provide an image URL.");
      return;
    }

    // Process image for dimensions/aspect ratio before calling parent's onAdd
    const imgSrc = useFile && newFile ? await readFileAsDataURL(newFile) : newUrl;

    if (!imgSrc) {
      toast.error("Failed to prepare image for validation.");
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const { isValid, message } = validateImage(img.width, img.height);
      if (isValid) {
        onAdd(e); // <--- HERE: Call the parent's onAdd, which triggers the mutation
                  // The parent's useMutation will handle its own success/error toasts
      } else {
        toast.error(message || "Image validation failed."); // Show validation error toast from here
      }
    };
    img.onerror = () => {
      toast.error("Failed to load image for validation. Please check the URL or file.");
    };
    img.src = imgSrc;
  };

  // Helper function to read file as Data URL
  const readFileAsDataURL = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string || null);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
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
              required={true}
            />
          </div>
        ) : (
          <Input
            id="newImageUrl"
            label="New Image URL"
            value={newUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/img.jpg"
            required={true}
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