// components/Admin/ProductImages.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { AdminProductImage } from "@/types/db";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "../ui/Checkbox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { toast } from "react-hot-toast";

interface AdminProductImagesProps {
  images?: AdminProductImage[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  newImageUrl: string;
  newFile: File | null;
  isThumbnail: boolean;
  onImageUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  onThumbnailChange: (val: boolean) => void;
  onAddImage: (e: React.FormEvent) => void;
  onDeleteImage: (id: string) => void;
  addLoading: boolean;
  deleteLoading: boolean;
}

const AdminProductImages: React.FC<AdminProductImagesProps> = ({
  images,
  isLoading,
  isError,
  error,
  newImageUrl,
  newFile,
  isThumbnail,
  onImageUrlChange,
  onFileChange,
  onThumbnailChange,
  onAddImage,
  onDeleteImage,
  addLoading,
  deleteLoading,
}) => {
  const [useFile, setUseFile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) {
      toast.error(`Error loading images: ${error.message}`);
    }
  }, [isError, error]);

  const openConfirm = (id: string) => {
    setSelectedDeleteId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteId) {
      toast.promise(
        new Promise<void>((resolve, reject) => {
          try {
            onDeleteImage(selectedDeleteId);
            resolve();
          } catch (e) {
            reject(e);
          }
        }),
        {
          loading: "Deleting image...",
          success: "Image deleted successfully!",
          error: "Failed to delete image.",
        }
      );
    }
    setModalOpen(false);
    setSelectedDeleteId(null);
  };

  // Helper function to validate image dimensions and aspect ratio
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFile && !newImageUrl) {
      toast.error("Please provide an image URL or upload a file.");
      return;
    }

    const processImage = (imgSrc: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const { isValid, message } = validateImage(img.width, img.height);
          if (isValid) {
            onAddImage(e);
            resolve();
          } else {
            reject(new Error(message));
          }
        };
        img.onerror = () => {
          reject(
            new Error("Failed to load image from URL. Please check the URL.")
          );
        };
        img.src = imgSrc;
      });
    };

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          if (useFile && newFile) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                if (event.target?.result) {
                  await processImage(event.target.result as string);
                  resolve();
                } else {
                  reject(new Error("Failed to read file."));
                }
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = () => {
              reject(new Error("Failed to read the selected file."));
            };
            reader.readAsDataURL(newFile);
          } else if (!useFile && newImageUrl) {
            await processImage(newImageUrl);
            resolve();
          } else {
            reject(new Error("No image data provided."));
          }
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: "Validating and uploading image...",
        success: "Image uploaded successfully!",
        error: (err) => `Failed to upload image: ${err.message}`,
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
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-lg shadow-sm border border-secondary"
            >
              <Image
                src={image.image_url}
                alt="Product Image"
                width={150}
                height={150}
                unoptimized
                className="w-full h-32 object-cover"
              />
              {image.is_thumbnail && (
                <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Thumbnail
                </span>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => openConfirm(image.id)}
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
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              required
            />
          </div>
        ) : (
          <Input
            id="newImageUrl"
            label="New Image URL"
            value={newImageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
          />
        )}

        <Checkbox
          id="isThumbnail"
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

export default AdminProductImages;
