"use client";

import React, { useState, useEffect, FormEvent } from "react";
// import Image from "next/image"; // Removed next/image due to resolution issues
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useAddPartnerProductImageMutation, useDeletePartnerProductImageMutation } from "@/redux/features/partnerProducts/partnerProductsApi";

interface PartnerProductImagesProps {
  productId: string;
  images: string[];
  thumbnail: string | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

const PartnerProductImages: React.FC<PartnerProductImagesProps> = ({
  productId,
  images,
  thumbnail,
  isLoading,
  isError,
  error,
}) => {
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isThumbnail, setIsThumbnail] = useState<boolean>(false);
  const [useFile, setUseFile] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeleteUrl, setSelectedDeleteUrl] = useState<string | null>(
    null
  );

  const [addPartnerImageMutation, { isLoading: addLoading, error: addError }] =
    useAddPartnerProductImageMutation();
  const [
    deletePartnerImageMutation,
    { isLoading: deleteLoading, error: deleteError },
  ] = useDeletePartnerProductImageMutation();

  useEffect(() => {
    if (isError && error) {
      toast.error(`Error loading images: ${error.message}`);
    }
  }, [isError, error]);

  useEffect(() => {
    if (addError) {
      toast.error(
        `Failed to add image: ${
          addError instanceof Error ? addError.message : "Unknown error"
        }`
      );
    }
    if (deleteError) {
      toast.error(
        `Failed to delete image: ${
          deleteError instanceof Error ? deleteError.message : "Unknown error"
        }`
      );
    }
  }, [addError, deleteError]);

  const openConfirm = (urlToDelete: string) => {
    setSelectedDeleteUrl(urlToDelete);
    setModalOpen(true);
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

  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Product ID is missing. Cannot add image.");
      return;
    }

    if (!newFile && !newImageUrl) {
      toast.error("Please provide an image URL or upload a file.");
      return;
    }

    let tempImageUrlForValidation: string | null = null;
    const formDataToSend = new FormData();
    formDataToSend.append("isThumbnail", String(isThumbnail));

    if (useFile && newFile) {
      formDataToSend.append("file", newFile);
      tempImageUrlForValidation = URL.createObjectURL(newFile);
    } else if (!useFile && newImageUrl) {
      formDataToSend.append("imageUrl", newImageUrl);
      tempImageUrlForValidation = newImageUrl;
    }

    if (!tempImageUrlForValidation) {
      toast.error("No image data to validate.");
      return;
    }

    const toastId = toast.loading("Validating image dimensions...");

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const { isValid, message } = validateImage(img.width, img.height);
          if (isValid) {
            resolve();
          } else {
            reject(new Error(message));
          }
        };
        img.onerror = () => {
          reject(
            new Error("Failed to load image for validation. Check URL/file.")
          );
        };
        img.src = tempImageUrlForValidation; // Correct placement for img.src assignment
      });
      toast.success("Image validated!", { id: toastId });

      if (useFile && newFile && tempImageUrlForValidation) {
        URL.revokeObjectURL(tempImageUrlForValidation);
      }

      await addPartnerImageMutation({
        id: productId,
        formData: formDataToSend,
      }).unwrap();

      toast.success("Image added successfully!");
      setNewImageUrl("");
      setNewFile(null);
      setIsThumbnail(false);
      setUseFile(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error";
      toast.error(`Failed to add image: ${errorMessage}`, { id: toastId });
      if (useFile && newFile && tempImageUrlForValidation) {
        URL.revokeObjectURL(tempImageUrlForValidation);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteUrl || !productId) {
      toast.error("Invalid image or product ID for deletion.");
      setModalOpen(false);
      setSelectedDeleteUrl(null);
      return;
    }

    const updatedImages = images.filter((url) => url !== selectedDeleteUrl);
    const updatedThumbnail = thumbnail === selectedDeleteUrl ? null : thumbnail;

    try {
      await deletePartnerImageMutation({
        id: productId,
        product_image_urls: updatedImages,
        thumbnail_url: updatedThumbnail ?? undefined,
      }).unwrap();
      toast.success("Image deleted successfully!");
    } catch (err: unknown) {
      toast.error(
        `Failed to delete image: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setModalOpen(false);
      setSelectedDeleteUrl(null);
    }
  };

  const allDisplayImages = Array.from(
    new Set([...(images || []), ...(thumbnail ? [thumbnail] : [])])
  );

  return (
    <div className="mt-10 pt-6 border-t border-secondary">
      <h3 className="text-xl font-bold text-primary mb-4">Product Images</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : allDisplayImages && allDisplayImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {allDisplayImages.map((imageUrl) => (
            <div
              key={imageUrl}
              className="relative group overflow-hidden rounded-lg shadow-sm border border-secondary"
            >
              <Image
                src={imageUrl}
                alt="Product Image"
                width={100}
                height={100}
                unoptimized
                className="w-full object-cover"
              />
              {imageUrl === thumbnail && (
                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Thumbnail
                </span>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => openConfirm(imageUrl)}
                isLoading={deleteLoading && selectedDeleteUrl === imageUrl}
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

      <div className="mb-4">
        <label className="inline-flex items-center space-x-4">
          <input
            type="radio"
            checked={!useFile}
            onChange={() => {
              setNewFile(null);
              setNewImageUrl("");
              setUseFile(false);
            }}
            className="form-radio text-primary"
          />
          <span className="text-primary">Use URL</span>
          <input
            type="radio"
            checked={useFile}
            onChange={() => {
              setNewFile(null);
              setNewImageUrl("");
              setUseFile(true);
            }}
            className="form-radio text-primary"
          />
          <span className="text-primary">Upload File</span>
        </label>
      </div>

      <form onSubmit={handleAddImage} className="space-y-3">
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
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              required={useFile && !newFile}
            />
          </div>
        ) : (
          <Input
            id="newImageUrl"
            label="New Image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required={!useFile && !newImageUrl}
          />
        )}

        <Checkbox
          id="isThumbnail"
          checked={isThumbnail}
          onChange={(e) => setIsThumbnail(e.target.checked)}
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
